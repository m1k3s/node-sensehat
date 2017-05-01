#!/usr/bin/env python

from sense_hat import SenseHat
from time import sleep

sense = SenseHat()
sense.low_light = True

r = [255, 0, 0]
o = [255, 127, 0]
y = [255, 255, 0]
g = [0, 255, 0]
b = [0, 0, 255]
i = [75, 0, 130]
v = [159, 0, 255]
e = [0, 0, 0]

image = [
g, g, y, y, y, o, r, v,
g, y, y, y, o, r, v, v,
y, y, y, o, r, v, v, v,
y, y, o, r, v, v, v, i,
y, o, r, v, v, v, i, i,
o, r, v, v, v, i, i, b,
r, v, v, v, i, i, b, b,
v, v, v, i, i, b, b, b
]

sense.set_pixels(image)
angles = [0, 90, 180, 270, 0]
for r in angles:
    sense.set_rotation(r)
    sleep(0.5)

sense.clear()

