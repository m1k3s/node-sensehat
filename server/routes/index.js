var express = require('express');
var router = express.Router();
var PythonShell = require('python-shell');
const pg = require('pg');
const path = require('path');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/sensehat';
PythonShell.defaultOptions = { scriptPath: 'server/python/' };

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, '..', '..', 'client', 'views', 'index.html'));
});

router.get('/db/env_sensors', function(req, res, next) {
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

router.get('/orientation', function (req, res, next) {
    let results = '';
    pyshell = new PythonShell('orientation.py', {mode: 'json'});

    pyshell.on('message', function (message) {
        results = message;
    });

    pyshell.end(function(err) {
        if (err) throw err;
        console.log('finished orientation function');
        return res.json(results);
    });
});

router.get('/loadavg', function (req, res, next) {
    let results = '';
    pyshell = new PythonShell('loadavg.py', {mode: 'json'});

    pyshell.on('message', function (message) {
        results = message;
    });

    pyshell.end(function(err) {
        if (err) throw err;
        console.log('finished getting load avg');
        return res.json(results);
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
        console.log('finished getting server info');
        return res.json(results);
    });
});

//router.post('/db/env_sensors', function(req, res, next) {
//    const results = [];
//    // Grab data from http request
//    const data = {text: req.body.text, complete: false};
//    // Get a Postgres client from the connection pool
//    pg.connect(connectionString, function(err, client, done) {
//        // Handle connection errors
//        if (err) {
//            done();
//            console.log(err);
//            return res.status(500).json({success: false, data: err});
//        }
//        // SQL Query > Insert Data
//        client.query('INSERT INTO environmental(temperature, humidity, pressure) values($1, $2, $3)',
//            [data.temperature, data.humidity, data.pressure]);
//        // SQL Query > Select Data
//        const query = client.query('SELECT * FROM items ORDER BY id ASC');
//        // Stream results back one row at a time
//        query.on('row', function(row) {
//            results.push(row);
//        });
//        // After all data is returned, close connection and return results
//        query.on('end', function() {
//            done();
//            return res.json(results);
//        });
//    });
//});

// use this end point to get raspberry pi load data
//router.get('/db/raspberry', function(req, res, next) {
//    const results = [];
//    // Get a Postgres client from the connection pool
//    pg.connect(connectionString, function(err, client, done) {
//        // Handle connection errors
//        if (err) {
//            done();
//            console.log(err);
//            return res.status(500).json({success: false, data: err});
//        }
//        // SQL Query > Select Data
//        const query = client.query('SELECT * FROM raspberry ORDER BY id ASC;');
//        // Stream results back one row at a time
//        query.on('row', function(row) {
//            results.push(row);
//        });
//        // After all data is returned, close connection and return results
//        query.on('end', function() {
//            done();
//            return res.json(results);
//        });
//    });
//});
//

//router.put('/db/env_sensors/:id', function(req, res, next) {
//  const results = [];
//  // Grab data from the URL parameters
//  const id = req.params.id;
//  // Grab data from http request
//  const data = {temperature: req.body.temperature, humidity: req.body.humidity, pressure: req.body.pressure};
//  // Get a Postgres client from the connection pool
//  pg.connect(connectionString, function(err, client, done) {
//    // Handle connection errors
//    if(err) {
//      done();
//      console.log(err);
//      return res.status(500).json({success: false, data: err});
//    }
//    // SQL Query > Update Data
//    client.query('UPDATE environmental SET temperature=($1), humidity=($2), pressure=($3)  WHERE id=($4)',
//    [data.temperature, data.humidity, data.pressure, id]);
//    // SQL Query > Select Data
//    const query = client.query("SELECT * FROM items ORDER BY id ASC");
//    // Stream results back one row at a time
//    query.on('row', function(row) {
//      results.push(row);
//    });
//    // After all data is returned, close connection and return results
//    query.on('end', function() {
//      done();
//      return res.json(results);
//    });
//  });
//});
//
//router.delete('/db/env_sensors/:id', function(req, res, next) {
//  const results = [];
//  // Grab data from the URL parameters
//  const id = req.params.id;
//  // Get a Postgres client from the connection pool
//  pg.connect(connectionString, function(err, client, done) {
//    // Handle connection errors
//    if(err) {
//      done();
//      console.log(err);
//      return res.status(500).json({success: false, data: err});
//    }
//    // SQL Query > Delete Data
//    client.query('DELETE FROM env_sensors WHERE id=($1)', [id]);
//    // SQL Query > Select Data
//    var query = client.query('SELECT * FROM environmental ORDER BY id ASC');
//    // Stream results back one row at a time
//    query.on('row', function(row) {
//      results.push(row);
//    });
//    // After all data is returned, close connection and return results
//    query.on('end', function() {
//      done();
//      return res.json(results);
//    });
//  });
//});

module.exports = router;


