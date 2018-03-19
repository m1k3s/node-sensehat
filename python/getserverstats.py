#!/usr/bin/env python

from sense_hat import SenseHat
import psycopg2
import os
import sys
import subprocess
import psutil
from time import sleep
import time
from random import randint
from lightshow import sparkle, lights, chase, rainbow

# insert sensehat data into the database
def post_env(cur, cal_t, h, p, cpu_t, raw_t) :
    try :
        cur.execute('INSERT INTO environmental (calibrated_temp, humidity, pressure, cpu_temp, raw_temp) VALUES (%s, %s, %s, %s, %s)', (cal_t, h, p, cpu_t, raw_t))
    except :
        print('Cannot INSERT into TABLE environmental')

# insert raspi load data into the database
def post_loadavg(cur, la1, la5, la15) :
    try :
        cur.execute('INSERT INTO loadavg (la1, la5, la15) VALUES (%s, %s, %s)', (la1, la5, la15))
    except :
        print('cannot INSERT into TABLE loadavg')

# insert network stats into the database
def post_netstats(cur, txbytes, rxbytes, txpackets, rxpackets, txrate, rxrate) :
    try :
        cur.execute('INSERT INTO netstats (bytes_sent, bytes_recv, packets_sent, packets_recv, tx_rate, rx_rate) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id', (txbytes, rxbytes, txpackets, rxpackets, txrate, rxrate))
    except :
        print('cannot INSERT into TABLE netstats')

    return cur.fetchone()[0]

# update the netstats tx & rx rate columns
def update_netstats(cur, idx, txrate, rxrate) :
    try :
        cur.execute('UPDATE netstats SET tx_rate=%s, rx_rate=%s WHERE id=%s', (txrate, rxrate, idx))
    except :
        print('cannot UPDATE TABLE netstats')

# query netstats row
def query_netstats(cur, idx) :
    try:
        cur.execute('SELECT * FROM netstats WHERE id=%s', (idx,))
    except:
        print('Cannot SELECT row from netstats')

    return cur.fetchone()

# insert disk stats
def post_diskstats(cur, read_bytes, write_bytes, rbytes, wbytes) :
    try:
        cur.execute('INSERT INTO diskstats (read_bytes, write_bytes, rbytes, wbytes) VALUES (%s, %s, %s, %s) RETURNING id', (read_bytes, write_bytes, rbytes, wbytes))
    except:
        print('cannot INSERT into TABLE diskstats')

    return cur.fetchone()[0]

# update diskstats read_bytes & write_bytes columns
def update_diskstats(cur, idx, rbytes, wbytes) :
    try:
        cur.execute('UPDATE diskstats SET rbytes=%s, wbytes=%s WHERE id=%s', (rbytes, wbytes, idx))
    except:
        print('cannot UPDATE TABLE diskstats')

# query diskstats row
def query_diskstats(cur, idx) :
    try:
        cur.execute('SELECT * FROM diskstats WHERE id=%s', (idx,))
    except:
        print('cannot SELECT row from diskstats')

    return cur.fetchone()

def diskIOStats() :
    stats = psutil.disk_io_counters(perdisk=True)
    read_bytes = stats['sda1'].read_bytes
    write_bytes = stats['sda1'].write_bytes
    return (read_bytes, write_bytes)

def networkStats() :
    stats = psutil.net_io_counters(pernic=True)
    txbytes = stats['eth0'].bytes_sent
    rxbytes = stats['eth0'].bytes_recv
    txpackets = stats['eth0'].packets_sent
    rxpackets = stats['eth0'].packets_recv

    return (txbytes, rxbytes, txpackets, rxpackets)

def sensehatData(s) :
    tc = s.get_temperature()
    h = s.get_humidity()
    p = s.get_pressure()

    # calibrate temperature
    cpu_temp = subprocess.check_output("/opt/vc/bin/vcgencmd measure_temp", shell=True)
    cpu_tempc = float(cpu_temp.decode("utf-8").replace("temp=","").replace("'C\n",""))
    # calibrate the temperature reading
    # temp_calibrated = (tempC - (cpu_tempC - tempC) / FACTOR) where FACTOR has to be arrived at
    # trial and error. Or by using another temperature sensor not affected by the cpu heat.
    t_cal = (tc - (cpu_tempc - tc)/1.1)

    return (round(t_cal, 1), round(h, 1), round(p, 1), round(cpu_tempc, 1), round(tc, 1))

def loadAvgs() :
    return os.getloadavg()

#print(os.environ.get('SQLDBUSER', 'user not found'))
#print(os.environ.get('SQLDBPWD', 'pwd not found'))
#print(os.environ.get('SQLDBNAME', 'name not found'))

def main():
    # database access vars
    hostname = 'localhost'
    username = os.environ.get('SQLDBUSER', '') 
    password = os.environ.get('SQLDBPWD', '')
    database = os.environ.get('SQLDBNAME', '')

    sense = SenseHat()

    traffic = networkStats()
    env = sensehatData(sense)
    loadavg = loadAvgs()
    disk = diskIOStats()

    # try to get a db connection and post the data
    try:
        conn = psycopg2.connect(host=hostname, user=username, password=password, dbname=database)
        conn.autocommit = True
        cur = conn.cursor()
    except:
        print("cannot connect to the {0} database".format(database))
     
    post_env(cur, env[0], env[1], env[2], env[3], env[4])
    post_loadavg(cur, loadavg[0], loadavg[1], loadavg[2])
    # long way around getting the flow rate
    # post the current readings returning the id
    idx = post_netstats(cur, traffic[0], traffic[1], traffic[2], traffic[3], 0, 0)
    if idx > 1:
        # get the previous row to subtract from
        prev = query_netstats(cur, idx - 1)
        #          0          1           2           3             4             5
        # prev = [id, timestamp, bytes_sent, bytes_recv, packets_sent, packets_recv, tx_rate, rx_rate]
        # now update the tx_rate and rx_rate columns
        # handle wrap and reboot cases
        tx_rate = traffic[0] if traffic[0] - prev[2] < 0 else traffic[0] - prev[2]
        rx_rate = traffic[1] if traffic[1] - prev[3] < 0 else traffic[1] - prev[3]    
        update_netstats(cur, idx, tx_rate, rx_rate)

    # do the same for the disk stats
    idx = post_diskstats(cur, disk[0], disk[1], 0, 0)
    if idx > 1:
        prev_disk = query_diskstats(cur, idx - 1)
        #               0          1           2            3       
        # prev_disk = [id, timestamp, read_bytes, write_bytes, rbytes, wbytes]
        rbytes = disk[0] if disk[0] - prev_disk[2] < 0 else disk[0] - prev_disk[2]
        wbytes = disk[1] if disk[1] - prev_disk[3] < 0 else disk[1] - prev_disk[3]
        update_diskstats(cur, idx, rbytes, wbytes)

    conn.close()

    h = time.localtime(time.time()).tm_hour
    if h >= 6 and h <= 20:
        # play the lights
        res = randint(0, 5)
        if res is 3:
            lights(sense)
        elif res is 2:
            sparkle(sense)
        elif res is 1:
            rainbow(sense)
        else:
            chase(sense)

if __name__ == "__main__":
    sys.exit(main())

