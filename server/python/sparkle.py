#!/usr/bin/env python

from sense_hat import SenseHat
from random import randint

sense = SenseHat()
sense.low_light = True

for z in range(0, 200):
    for x in range(0, 8):
        for y in range(0, 8):
            r = randint(10, 192)
            g = randint(10, 192)
            b = randint(10, 192)
            sense.set_pixel(x, y, r, g, b)

sense.clear()

