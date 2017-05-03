#!/usr/bin/env python
import os
import json

load = os.getloadavg()

one = load[0]
five = load[1]
fifteen = load[2]
# prints json one, five, and fifteen minute system load avg
print(json.dumps({'loadavg': {'one': one, 'five': five, 'fifteen': fifteen}}))

