#!/usr/bin/env python
# get the current orientation from the IMU

from sense_hat import SenseHat
import json

sense = SenseHat()
orientation = sense.get_orientation()

pitch = orientation['pitch']
roll = orientation['roll']
yaw = orientation['yaw']

print(json.dumps({'imu': {'pitch': pitch, 'roll': roll, 'yaw': yaw}}))

