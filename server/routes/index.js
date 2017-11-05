var express = require('express');
var router = express.Router();
var PythonShell = require('python-shell');
const pg = require('pg');
const path = require('path');
const connectionString = 'postgres://localhost:5432/serverstats';
PythonShell.defaultOptions = { scriptPath: 'server/python/' };

function buildQuery(table, range) {
    var query = [];
    switch (range) {
        case 'today':
            query = 'SELECT * FROM ' + table + ' WHERE timestamp > TIMESTAMP \'today\' ORDER BY timestamp ASC';
            break;
        case 'yesterday':
                query = 'SELECT * FROM ' + table + ' WHERE timestamp > TIMESTAMP \'yesterday\' AND timestamp < TIMESTAMP \'today\' ORDER BY timestamp ASC';
                break;
        case '7days':
            query = 'SELECT * FROM ' + table + ' WHERE timestamp > current_date - INTERVAL \'7 days\' ORDER BY timestamp ASC';
            break;
        case '30days':
            query = 'SELECT * FROM ' + table + ' WHERE timestamp > current_date - INTERVAL \'1 month\' ORDER BY timestamp ASC';
            break;
        case 'curmonth':
            query = 'SELECT * FROM ' + table + ' WHERE date_trunc(\'month\', timestamp) = date_trunc(\'month\', current_date) ORDER BY timestamp ASC';
            break;
        case 'lastmonth':
            query = 'SELECT * FROM ' + table + ' WHERE timestamp >= date_trunc(\'month\', current_date - INTERVAL \'1 month\') AND timestamp < date_trunc(\'month\', current_date) ORDER BY timestamp ASC';
                break;
            case 'last2months':
            query = 'SELECT * FROM ' + table + ' WHERE timestamp > current_date - INTERVAL \'2 months\' ORDER BY timestamp ASC';
            break;
        case 'last3months':
            query = 'SELECT * FROM ' + table + ' WHERE timestamp > current_date - INTERVAL \'3 months\' ORDER BY timestamp ASC';
            break;
        // case 'custom':
            // query = 'SELECT * FROM ' + table + ' WHERE timestamp BETWEEN \'2017-06-01\' AND \'2017-06-03\'';
            // break;
        default:
            break;
    }
    return query;
}

// GET home page
router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, '..', '..', 'client', 'views', 'index.html'));
});

router.get('/db/env_sensors/:range', function getSensorData(req, res, next) {
    const results = [];
    const range = req.params.range;
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        var query = [];
        var queryStr = buildQuery('environmental', range);
        query = client.query(queryStr);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });
    });
});

router.get('/db/loadavg/:range', function getLoadAvgData(req, res, next) {
    const results = [];
    const range = req.params.range;
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        var query = [];
        var queryStr = buildQuery('loadavg', range);
        query = client.query(queryStr);
        
        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });
    });
});

router.get('/db/netstats/:range', function getNetStatsData(req, res, next) {
    const results = [];
    const range = req.params.range;
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        var query = [];
        var queryStr = buildQuery('netstats', range);
        query = client.query(queryStr);
                
        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });
    });
});

router.get('/db/diskstats/:range', function getDiskStatsData(req, res, next) {
    const results = [];
    const range = req.params.range;
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        var query = [];
        var queryStr = buildQuery('diskstats', range);
        query = client.query(queryStr);
                
        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });
    });
});

router.get('/serverinfo', function getServerInfo(req, res, next) {
    let results = '';
    pyshell = new PythonShell('getserverinfo.py', {mode: 'json'});

    pyshell.on('message', function (message) {
        results = message;
    });

    pyshell.end(function(err) {
        if (err) throw err;
        return res.json(results);
    });
});

router.get('/sysinfo', function getSystemInfo(req, res, next) {
    let results = '';
    pyshell = new PythonShell('getsysteminfo.py', {mode: 'json'});

    pyshell.on('message', function (message) {
        results = message;
    });

    pyshell.end(function(err) {
        if (err) throw err;
        return res.json(results);
    });
});

router.post('/rainbow', function postRainbow(req, res, next) {
    PythonShell.run('rainbow.py', function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        //console.log('results: %j', results);
    });
});

router.post('/sparkle', function postSparkle(req, res, next) {
    PythonShell.run('sparkle.py', function(err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        //console.log('results: %j', results);
    });
});

module.exports = router;

