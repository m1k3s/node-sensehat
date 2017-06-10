#!/bin/env python

str = sp.check_output("/home/mike/node-sensehat/shell/cu.sh", shell=True).decode("utf-8")
return str

