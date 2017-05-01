#!/usr/bin/env python
# get server info

from sense_hat import SenseHat
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

# devise a json plan
print(json.dumps(
    {'serverinfo': {
        'loadavg': {'one': one, 'five': five, 'fifteen': fifteen},
        'imu': {'pitch': pitch, 'roll': roll, 'yaw': yaw}
    }}))

