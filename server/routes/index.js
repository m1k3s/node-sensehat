var express = require('express');
var router = express.Router();
var PythonShell = require('python-shell');
const pg = require('pg');
const path = require('path');
const connectionString = 'postgres://localhost:5432/serverstats';
PythonShell.defaultOptions = { scriptPath: 'server/python/' };

var db = require('queries');

// GET home page
router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, '..', '..', 'client', 'views', 'index.html'));
});

router.get('/db/env_sensors', /function(req, res, next) {
    const results = [];
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        // SQL Query > Select Data
        const query = client.query('SELECT * FROM environmental ORDER BY id ASC;');
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

// post to call the python script using nodejs python-shell
router.post('/rainbow', function(req, res, next) {
    PythonShell.run('rainbow.py', function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        //console.log('results: %j', results);
    });
});

router.post('/sparkle', function(req, res, next) {
    PythonShell.run('sparkle.py', function(err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        //console.log('results: %j', results);
    });
});

router.get('/db/loadavg', function(req, res, next) {
    const results = [];
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        // SQL Query > Select Data
        const query = client.query('SELECT * FROM loadavg ORDER BY id ASC;');
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

// get only the last 'rows' number of rows from db
router.get('/db/env_sensors/:rows', function(req, res, next) {
    const results = [];
    const rows = req.params.rows;
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        // SQL Query > Select last 'rows' number of rows of Data
        const query = client.query('SELECT * FROM (SELECT * FROM environmental ORDER BY id DESC LIMIT ($1)) AS temp ORDER BY id ASC', [rows]);
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

router.get('/db/env_sensors/:start:end', function(req, res, next) {
    const results = [];
    const start = req.params.start;
    const end = req.params.end;
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        // SQL Query > Select last 'rows' number of rows of Data
        const query = client.query('SELECT * FROM environmental WHERE timestamp BETWEEN \'($1)\' AND \'($2)\'', [start, end]);
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

router.get('/db/loadavg/:rows', function(req, res, next) {
    const results = [];
    const rows = req.params.rows;
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        // SQL Query > Select last 'rows' number of rows of Data
        const query = client.query('SELECT * FROM (SELECT * FROM loadavg ORDER BY id DESC LIMIT ($1)) AS temp ORDER BY id ASC', [rows]);
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

router.get('/serverinfo', function (req, res, next) {
    let results = '';
    pyshell = new PythonShell('getserverinfo.py', {mode: 'json'});

    pyshell.on('message', function (message) {
        results = message;
    });

    pyshell.end(function(err) {
        if (err) throw err;
        //console.log('finished getting server info');
        return res.json(results);
    });
});

router.get('/sysinfo', function (req, res, next) {
    let results = '';
    pyshell = new PythonShell('getsysteminfo.py', {mode: 'json'});

    pyshell.on('message', function (message) {
        results = message;
    });

    pyshell.end(function(err) {
        if (err) throw err;
        //console.log('finished getting server info');
        return res.json(results);
    });
});

router.get('/db/netstats', function(req, res, next) {
    const results = [];
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        // SQL Query > Select Data
        const query = client.query('SELECT * FROM netstats ORDER BY id ASC;');
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

router.get('/db/netstats/:rows', function(req, res, next) {
    const results = [];
    const rows = req.params.rows;
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        // SQL Query > Select last 'rows' number of rows of Data
        const query = client.query('SELECT * FROM (SELECT * FROM netstats ORDER BY id DESC LIMIT ($1)) AS temp ORDER BY id ASC', [rows]);
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

router.get('/db/diskstats', function(req, res, next) {
    const results = [];
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        // SQL Query > Select Data
        const query = client.query('SELECT * FROM diskstats ORDER BY id ASC;');
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

router.get('/db/diskstats/:rows', function(req, res, next) {
    const results = [];
    const rows = req.params.rows;
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        // SQL Query > Select last 'rows' number of rows of Data
        const query = client.query('SELECT * FROM (SELECT * FROM diskstats ORDER BY id DESC LIMIT ($1)) AS temp ORDER BY id ASC', [rows]);
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


module.exports = router;

