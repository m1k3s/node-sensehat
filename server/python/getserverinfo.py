#!/usr/bin/env python
# get server info

from sense_hat import SenseHat
from datetime import timedelta
import json
import os

sense = SenseHat()
orientation = sense.get_orientation()

pitch = orientation['pitch']
roll = orientation['roll']
yaw = orientation['yaw']

load = os.getloadavg()

one = load[0]
five = load[1]
fifteen = load[2]

info = os.uname()

sys = info[0]
node = info[1]
kernel = info[2]
march = info[4]

with open('/proc/uptime', 'r') as f:
    uptime_seconds = float(f.readline().split()[0])
    uptime_string = str(timedelta(seconds = uptime_seconds))

# devise a json plan
print(json.dumps(
    {'serverinfo': {
        'loadavg': {'one': one, 'five': five, 'fifteen': fifteen},
        'imu': {'pitch': pitch, 'roll': roll, 'yaw': yaw},
        'node': {'sys': sys, 'node': node, 'kernel': kernel, 'march': march},
        'uptime': {'uptime': uptime_string}
    }}))

