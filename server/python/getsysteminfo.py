#!/usr/bin/env python

import psutil
import json

mem = psutil.virtual_memory()
disk = psutil.disk_usage('/')

print(json.dumps(
    {'sysinfo': {
        'memory': {'free': mem.available, 'total': mem.total, 'percent': mem.percent},
        'disk': {'free': disk.free, 'total': disk.total, 'percent': disk.percent}
    }}))

