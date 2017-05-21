#!/usr/bin/env python

from sense_hat import SenseHat
import psycopg2
import os
import psutil
from time import sleep
import time

# fun with the LED matrix
def lights(s) :
    r = [255, 0, 0]
    y = [255, 255, 0]
    g = [0, 255, 0]
    b = [0, 0, 255]

    image = [
        b, b, b, b, r, r, r, r,
        b, b, b, b, r, r, r, r,
        b, b, b, b, r, r, r, r,
        b, b, b, b, r, r, r, r,
        y, y, y, y, g, g, g, g,
        y, y, y, y, g, g, g, g,
        y, y, y, y, g, g, g, g,
        y, y, y, y, g, g, g, g
    ]
    s.set_pixels(image)
    s.low_light = True

    angles = [0, 90, 180, 270, 0, 90, 180, 270, 0]
    for r in angles :
        s.set_rotation(r)
        sleep(0.25)

    sleep(0.5)
    s.clear()

# insert sensehat data into the database
def post_env(cur, t, h, p) :
    try :
        cur.execute('INSERT INTO environmental (temperature, humidity, pressure) VALUES (%s, %s, %s)', (t, h, p))
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
    t = s.get_temperature()
    h = s.get_humidity()
    p = s.get_pressure()

    # return temperature as Fahrenheit
    return (t * 1.8 + 32, h, p)

def loadAvgs() :
    return os.getloadavg()
    
# database access vars
hostname = 'localhost'
username = 'mike' # os.environ.get('SQLDBUSER', '') 
password = 'b8zslct!' # os.environ.get('SQLDBPWD', '')
database = 'sensehat' # os.environ.get('SQLDBNAME', '')

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
    print("cannot connect to database")
 
post_env(cur, env[0], env[1], env[2])
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
    lights(sense)

