#!/usr/bin/env python

from sense_hat import SenseHat
from random import randint
from time import time
from time import sleep


def sparkle(sense):
    #sense = SenseHat()
    sense.low_light = True
    end = time() + 5

    while time() < end:
        for x in range(0, 8):
            for y in range(0, 8):
                r = randint(10, 192)
                g = randint(10, 192)
                b = randint(10, 192)
                sense.set_pixel(x, y, r, g, b)

    sense.clear()


# fun with the LED matrix
def lights(sense):
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
    sense.set_pixels(image)
    sense.low_light = True

    angles = [0, 90, 180, 270, 0, 90, 180, 270, 0]
    for r in angles :
        sense.set_rotation(r)
        sleep(0.25)

    sleep(0.5)
    sense.clear()

def chase(sense):
    r = [255, 0, 0]
    y = [255, 255, 0]
    g = [0, 255, 0]
    b = [0, 0, 255]
    o = [0, 0, 0]

    sense.low_light = True

    image0 = [
        b, b, b, b, o, o, o, o,
        b, b, b, b, o, o, o, o,
        b, b, b, b, o, o, o, o,
        b, b, b, b, o, o, o, o,
        o, o, o, o, o, o, o, o,
        o, o, o, o, o, o, o, o,
        o, o, o, o, o, o, o, o,
        o, o, o, o, o, o, o, o
    ]
    image1 = [
        r, r, r, r, o, o, o, o,
        r, r, r, r, o, o, o, o,
        r, r, r, r, o, o, o, o,
        r, r, r, r, o, o, o, o,
        o, o, o, o, o, o, o, o,
        o, o, o, o, o, o, o, o,
        o, o, o, o, o, o, o, o,
        o, o, o, o, o, o, o, o
    ]
    image2 = [
        y, y, y, y, o, o, o, o,
        y, y, y, y, o, o, o, o,
        y, y, y, y, o, o, o, o,
        y, y, y, y, o, o, o, o,
        o, o, o, o, o, o, o, o,
        o, o, o, o, o, o, o, o,
        o, o, o, o, o, o, o, o,
        o, o, o, o, o, o, o, o
    ]  
    image3 = [
        g, g, g, g, o, o, o, o,
        g, g, g, g, o, o, o, o,
        g, g, g, g, o, o, o, o,
        g, g, g, g, o, o, o, o,
        o, o, o, o, o, o, o, o,
        o, o, o, o, o, o, o, o,
        o, o, o, o, o, o, o, o,
        o, o, o, o, o, o, o, o
    ]
    images = [image0, image1, image2, image3]

    for image in images:
        sense.set_pixels(image)
        angles = [0, 90, 180, 270]
        for r in angles :
            sense.set_rotation(r)
            sleep(0.10)

    sense.set_rotation(0)
    sleep(0.10)
    sense.clear()

def rainbow(sense):
    r = [255, 0, 0]
    o = [255, 127, 0]
    y = [255, 255, 0]
    g = [0, 255, 0]
    b = [0, 0, 255]
    i = [75, 0, 130]
    v = [159, 0, 255]
    #e = [0, 0, 0]
  
    image = [
        g, g, y, y, y, o, r, r,
        g, y, y, y, o, r, r, v,
        y, y, y, o, r, r, v, v,
        y, y, o, r, r, v, v, i,
        y, o, r, r, v, v, i, i,
        o, r, r, v, v, i, i, b,
        r, r, v, v, i, i, b, b,
        r, v, v, i, i, b, b, b
    ]
  
    sense.set_pixels(image)
    sense.low_light = True

    angles = [0, 90, 180, 270, 0 , 90, 180, 270, 0]
    for r in angles:
        sense.set_rotation(r)
        sleep(0.25)

    sleep(0.25)
    sense.clear()


