var express = require('express');
var router = express.Router();
var PythonShell = require('python-shell');
const pg = require('pg');
const path = require('path');
const connectionString = 'postgres://localhost:5432/serverstats';
PythonShell.defaultOptions = { scriptPath: 'server/python/' };

var db = require('./queries.js');

// GET home page
router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, '..', '..', 'client', 'views', 'index.html'));
});

router.get('/db/env_sensors/:range', db.getSensorData);
router.get('/db/loadavg/:range', db.getLoadAvgData);
router.get('/db/netstats/:range', db.getNetStatsData);
router.get('/db/diskstats/:range', db.getDiskStatsData);
router.get('/serverinfo', db.getServerInfo);
router.get('/sysinfo', db.getSystemInfo);

router.post('/rainbow', db.postRainbow);
router.post('/sparkle', db.postSparkle);

module.exports = router;

