var app = angular.module('rpi3', ['n3-line-chart']);

let logMap = new Map();
logMap.set('1e-1', '0');
logMap.set('1e+0', '1');
logMap.set('1e+1', '10');
logMap.set('1e+2', '100');
logMap.set('1e+3', '1K');
logMap.set('1e+4', '10K');
logMap.set('1e+5', '100K');
logMap.set('1e+6', '1M');
logMap.set('1e+7', '10M');
logMap.set('1e+8', '100M');
logMap.set('1e+9', '1G');

// format the network and disk axis labels to human readable form
function getFormat(n) {
    let result = (n >= 1000000 ? (n / 1048576).toFixed(2) + ' MBytes' :
    n < 1000 ? n.toFixed(2) + ' Bytes':
    (n / 1024).toFixed(2) + ' KBytes');
    return result;
}

app.service('sensorDataService', function($http) {
    var getSensorData = function(range) {
            return $http.get('/db/env_sensors/' + range).then(function(response) {
                return response;
        });
    };
    return { getSensorData: getSensorData };
});

app.service('loadAvgService', function ($http) {
    var getLoadAvg = function(range) {
	    return $http.get('/db/loadavg/' + range).then(function(response) {
		return response;
	});
    };
    return { getLoadAvg: getLoadAvg };
});

app.service('netstatsService', function ($http) {
    var getNetStats = function(range) {
	return $http.get('/db/netstats/' + range).then(function(response) {
	    return response;
	});
    };
    return { getNetStats: getNetStats };
});

app.service('diskstatsService', function ($http) {
    var getDiskStats = function(range) {
	return $http.get('/db/diskstats/' + range).then(function(response) {
	    return response;
	});
    };
    return { getDiskStats: getDiskStats };
});

app.controller('rpi3Ctrl', function($scope, sensorDataService, loadAvgService, netstatsService, diskstatsService) {
    $scope.data0 = [];
    $scope.isLoaded0 = false;
    $scope.data1 = [];
    $scope.isLoaded1 = false;
    $scope.data2 = [];
    $scope.isLoaded2 = false;
    $scope.data3 = [];
    $scope.isLoaded3 = false;
    $scope.items = [
        {name: 'Today',         value: 'today'},
        {name: 'Yesterday',     value: 'yesterday'},
        {name: 'Last 7 Days',   value: '7days'},
        {name: 'Last 30 Days',  value: '30days'},
        {name: 'This Month',    value: 'curmonth'},
        {name: 'Last Month',    value: 'lastmonth'},
        {name: 'Last 2 Months', value: 'last2months'},
        {name: 'Last 3 Months', value: 'last3months'}//,
        //{name: 'Custom Range',  value: 'custom'}
    ];
    $scope.objSelectedRow = {selectedRow: $scope.items[0]}; // default to 'today'

    $scope.updateData = function() {
        sensorDataService.getSensorData($scope.objSelectedRow.selectedRow.value).then(function(response) {
            $scope.data0 = response;
            $scope.data0.data.forEach(function(row) {
                row.timestamp = new Date(row.timestamp);
                if (row.humidity < 0.0) {
                    row.humidity = 0.0;
                }
                // this can probably be removed once we move beyond the 5 day point
                // HACK ALERT: making some serious assumptions here...
                //if (row.calibrated_temp > 60.0) {
                //    row.calibrated_temp = ((row.calibrated_temp - 32.0) * 0.55556).toFixed(1);
                //}
                //if (row.cpu_temp > 65.0) {
                //    row.cpu_temp = ((row.cpu_temp - 32.0) * 0.55556).toFixed(1);
                //}
            });
            $scope.isLoaded0 = true;
        }, function() {
            $scope.error = 'Unable to GET environmental data';
        });

        loadAvgService.getLoadAvg($scope.objSelectedRow.selectedRow.value).then(function(response) {
            $scope.data1 = response;
            $scope.data1.data.forEach(function(row) {
                row.timestamp = new Date(row.timestamp);
            });
            $scope.isLoaded1 = true;
        }, function() {
            $scope.error = 'Unable to GET loadavg data';
        });
       
        netstatsService.getNetStats($scope.objSelectedRow.selectedRow.value).then(function(response) {
            $scope.data2 = response;
            $scope.data2.data.forEach(function(row) {
                row.timestamp = new Date(row.timestamp);
                // this data plotted on log axis, make sure 
                // there are no zero | negative data points
                if (row.tx_rate < 1) {row.tx_rate = 1;}
                if (row.rx_rate < 1) {row.rx_rate = 1;}
            });
            $scope.isLoaded2 = true;
        }, function() {
            $scope.error = 'Unable to GET netstats data';
        });

        diskstatsService.getDiskStats($scope.objSelectedRow.selectedRow.value).then(function(response) {
            $scope.data3 = response;
            $scope.data3.data.forEach(function(row) {
                row.timestamp = new Date(row.timestamp);
                // this data plotted on log axis, make sure 
                // there are no zero | negative data points
                if (row.rbytes < 0.1) {row.rbytes = 0.1;}
                if (row.wbytes < 0.1) {row.wbytes = 0.1;}
            });
            $scope.isLoaded3 = true;
        }, function() {
            $scope.error = 'Unable to GET diskstats data';
        });
    }
   
    // this function gets and updates the data
    $scope.updateData();

    $scope.options0 = {
        zoom: { x: true, y: false },
        pan: {x: true, y: false, y2: false },
        margin: {top: 20, right: 50, left: 50, bottom: 50},
        series: [
            {
                axes: 'y',
                dataset: 'data',
                key: 'cpu_temp',
                padding: {min: 15, max: 20},
                defined: function(value) {
                    return value.y1 != undefined;
                },
                label: 'CPU',
                color: '#ff0000',
                type: ['line'], //'area'],
                id: 'Series0a',
                //interpolation: {mode: 'cardinal', tension: 0.7}
                interpolation: { mode: 'monotone' }
            },
            {
                axes: 'y',
                dataset: 'data',
                key: 'raw_temp',
                padding: {min: 15, max: 20},
                defined: function(value) {
                    return value.y1 != undefined;
                },
                label: 'Raw',
                color: '#00ccff',
                type: ['line'], //, 'area'],
                id: 'Series0b',
                //interpolation: {mode: 'cardinal', tension: 0.7}
                interpolation: { mode: 'monotone' }
            },
            {
                axes: 'y',
                dataset: 'data',
                key: 'calibrated_temp',
                padding: {min: 15, max: 20},
                defined: function(value) {
                    return value.y1 != undefined;
                },
                label: 'Calibrated',
                color: '#00ff00',
                type: ['line'], //, 'area'],
                id: 'Series0',
                //interpolation: {mode: 'cardinal', tension: 0.7}
                interpolation: { mode: 'monotone' }
            }
        ],
        grid: { 
            x: true,
            y: true
        },
        axes: {
            x: {
                key: 'timestamp',
                type: 'date',
                ticks: 6,
                tickFormat: d3.time.format('%x')
            },
            y: {
                key: 'calibrated_temp',
                tickFormat: function(value, index) {
                    return (parseFloat(value)).toFixed(0) + 'C';
                }
            },
            y2: {
                key: 'raw_temp',
                tickFormat: function(value, index) {
                    return (parseFloat(value) * 1.8 + 32.0).toFixed(0) + 'F';
                }
            }
        },
        tooltipHook: function(d) {
            if (d) {
                return {
                    abscissas: d[0].row.x.toTimeString(),
                    rows: d.map(function(s) {
                        let n = parseFloat(s.row.y1);
                        let valueLabel = (n.toFixed(1) + 'C (' + (n * 1.8 + 32).toFixed(1) + 'F)');
                        return {
                            label: s.series.label,
                            value: valueLabel,
                            color: s.series.color,
                            id: s.series.id
                        }
                    })
                }
            }
        }

    };

    $scope.options1 = {
        zoom: { x: true, y: false },
        pan: {x: true, y: false, y2: false },
        margin: {top: 20, right: 50, left: 50, bottom: 50},
        series: [
            {
                axes: 'y',
                dataset: 'data',
                padding: {min: 5, max: 10},
                key: 'humidity',
                defined: function(value) {
                    return value.y1 != undefined;
                },
                label: 'Humidity',
                color: '#00cd00',
                type: ['line'],// 'area'],
                id: 'Series1a',
                //interpolation: {mode: 'cardinal', tension: 0.7}
                interpolation: { mode: 'monotone' }
            },
            {
                axes: 'y',
                dataset: 'data',
                padding: {min: 5, max: 10},
                key: 'humidity',
                defined: function(value) {
                    return value.y1 != undefined;
                },
                label: 'Smoothed',
                color: '#cd0000',
                type: ['line'],
                id: 'Series1b',
                interpolation: {mode: 'basis'}
            }
        ],
        grid: {
            x: true,
            y: true
        },
        axes: {
            x: {
                key: 'timestamp',
                type: 'date',
                ticks: 6,
                tickFormat: d3.time.format('%x')
            },
            y: {
                key: 'humidity',
                tickFormat: function(value, index) {
                    return (parseFloat(value)).toFixed(0) + '%RH';
                }
            },
            y2: {
                key: 'humidity',
                tickFormat: function(value, index) {
                    return (parseFloat(value)).toFixed(0) + '%RH';
                }
            }

        },
        tooltipHook: function(d) {
            return {
                abscissas: d[0].row.x.toTimeString(),
                rows: d.map(function(s) {
                    return {
                        label: s.series.label,
                        value: s.row.y1 + '%RH',
                        color: s.series.color,
                        id: s.series.id
                    }
                })
            }
        }

    };

    $scope.options2 = {
        zoom: { x: true, y: false },
        pan: {x: true, y: false, y2: false },
        margin: {top: 20, right: 50, left: 60, bottom: 50},
        series: [
            {   
                axes: 'y',
                dataset: 'data',
                key: 'pressure',
                padding: {min: 5, max: 10},
                defined: function(value) {
                    return value.y1 != undefined;
                },
                label: 'Pressure',
                color: '#1e90ff',
                type: ['line'],// 'area'],
                id: 'Series2a',
                //interpolation: {mode: 'cardinal', tension: 0.7}
                //interpolation: { mode: 'monotone' }
            },
            {   
                axes: 'y',
                dataset: 'data',
                key: 'pressure',
                padding: {min: 5, max: 10},
                defined: function(value) {
                    return value.y1 != undefined;
                },
                label: 'Smoothed',
                color: '#fe0000',
                type: ['line'],// 'area'],
                id: 'Series2b',
                //interpolation: {mode: 'cardinal', tension: 0.7}
                interpolation: { mode: 'basis' }
            }
        ],
        grid: {
            x: true,
            y: true
        },
        axes: {
            x: {
                key: 'timestamp',
                type: 'date',
                ticks: 6,
                tickFormat: d3.time.format('%x')
            },
            y: {
                key: 'pressure',
                tickFormat: function(value, index) {
                    return (parseFloat(value)).toFixed(1) + ' hPa';
                }
            },
            y2: {
                key: 'pressure',
                tickFormat: function(value, index) {
                    return (parseFloat(value) * 0.0295301).toFixed(2) + ' Hg';
                }
            }
        },
        tooltipHook: function(d) {
            if (d) {
                return {
                    abscissas: d[0].row.x.toTimeString(),
                    rows: d.map(function(s) {
                        let n = parseFloat(s.row.y1);
                        return {
                            label: s.series.label,
                            value: n.toFixed(1) + ' hPa (' + (n * 0.0295301).toFixed(2) + ' Hg)',
                            color: s.series.color,
                            id: s.series.id
                        }
                    })
                }
            }
        }

    };

    $scope.options3 = {
        zoom: { x: true, y: false },
        pan: {x: true, y: false, y2: false },
        margin: {top: 20, right: 50, left: 50, bottom: 50},
        series: [
            {
                axes: 'y',
                dataset: 'data',
                key: 'la1',
                padding: {min: 5, max: 10},
                defined: function(value) {
                     return value.y1 != undefined;
                },
                label: '1 minute',
                color: '#ff2222',
                type: ['line', 'area'],
                id: 'Series3',
                interpolation: {mode: 'cardinal', tension: 0.7}
                //interpolation: { mode: 'monotone' }
            },
            {
                axes: 'y',
                dataset: 'data',
                key: 'la5',
                padding: {min: 5, max: 10},
                defined: function(value) {
                     return value.y1 != undefined;
                },
                label: '5 minute',
                color: '#22ff22',
                type: ['line', 'area'],
                id: 'Series4',
                interpolation: {mode: 'cardinal', tension: 0.7}
                //interpolation: { mode: 'monotone' }
            },
            {
                axes: 'y',
                dataset: 'data',
                key: 'la15',
                padding: {min: 5, max: 10},
                defined: function(value) {
                     return value.y1 != undefined;
                },
                label: '15 minute',
                color: '#4876ff',
                type: ['line', 'area'],
                id: 'Series5',
                interpolation: {mode: 'cardinal', tension: 0.7}
                //interpolation: { mode: 'monotone' }
            }

        ],
        grid: {
            x: true,
            y: true
        },
        axes: {
            x: {
                key: 'timestamp',
                type: 'date',
                ticks: 6,
                tickFormat: d3.time.format('%x')
            }
        },
        tooltipHook: function(d) {
            if (d) {
                return {
                    abscissas: d[0].row.x.toTimeString(),
                    rows: d.map(function(s) {
                        return {
                            label: s.series.label,
                            value: s.row.y1,
                            color: s.series.color,
                            id: s.series.id
                        }
                    })
                }
            }
        }
    };

    $scope.options4 = {
        zoom: { x: true, y: false },
        pan: {x: true, y: false, y2: false },
        margin: {top: 20, right: 50, left: 50, bottom: 50},
        series: [
           {
               axes: 'y',
               dataset: 'data',
               key: 'rx_rate',
               defined: function(value) {
                    return value.y1 != undefined;
               },
               label: 'RX Bytes/15 minutes',
               color: '#e066ff',
               type: ['line'],// 'area'],
               id: 'Series7',
               interpolation: {mode: 'step'}
           },
           {
               axes: 'y',
               dataset: 'data',
               key: 'tx_rate',
               padding: {min: 5, max: 10},
               defined: function(value) {
                    return value.y1 != undefined;
               },
               label: 'TX Bytes/15 minutes',
               color: '#20b2aa',
               type: ['line'],// 'area'],
               id: 'Series6',
               interpolation: {mode: 'step'}
           }
        ],
        grid: {
            x: true,
            y: true
        },
        axes: {
            x: {
                key: 'timestamp',
                type: 'date',
                ticks: 6,
                tickFormat: d3.time.format('%x')
            },
            y: {
                type: 'log',
                min: 1,
                tickFormat: function(n, idx) {
                    return logMap.get(n.toExponential());
                }
            },
            y2: {
                type: 'log',
                min: 1,
                tickFormat: function(n, idx) {
                    return logMap.get(n.toExponential());
                }
            }
        },
        tooltipHook: function(d) {
            if (d) {
                return {
                    abscissas: 'eth0 ' + d[0].row.x.toTimeString(),
                    rows: d.map(function(s) {
                        return {
                            label: s.series.label,
                            value: getFormat(parseInt(s.row.y1)),
                            color: s.series.color,
                            id: s.series.id
                        }
                    })
                }
            }
        }
    };

    $scope.options5 = {
        zoom: { x: true, y: false },
        pan: {x: true, y: false, y2: false },
        margin: {top: 20, right: 50, left: 50, bottom: 50},
        series: [
           {
               axes: 'y',
               dataset: 'data',
               key: 'wbytes',
               padding: {min: 5, max: 10},
               defined: function(value) {
                    return value.y1 != undefined;
               },
               label: 'Write Bytes/15 minutes',
               color: '#7ccd7c',
               type: ['line'],// 'area'],
               id: 'Series8',
               interpolation: {mode: 'step'}
           },
           {
               axes: 'y',
               dataset: 'data',
               key: 'rbytes',
               defined: function(value) {
                    return value.y1 != undefined;
               },
               label: 'Read Bytes/15 minutes',
               color: '#ff5400',
               type: ['line'], //'area'],
               id: 'Series9',
               interpolation: {mode: 'step'}
           }
        ],
        grid: {
            x: true,
            y: true
        },
        axes: {
            x: {
                key: 'timestamp',
                type: 'date',
                ticks: 6,
                tickFormat: d3.time.format('%x')
            },
            y: {
                type: 'log',
                min: 1,
                tickFormat: function(n, idx) {
                    return logMap.get(n.toExponential());
                }
            },
            y2: {
                type: 'log',
                min: 1,
                tickFormat: function(n, idx) {
                    return logMap.get(n.toExponential());
                }
            }
        },
        tooltipHook: function(d) {
            if (d) {
                return {
                    abscissas: 'sda1 ' + d[0].row.x.toTimeString(),
                    rows: d.map(function(s) {
                        return {
                            label: s.series.label,
                            value: getFormat(parseInt(s.row.y1)),
                            color: s.series.color,
                            id: s.series.id
                        }
                    })
                }
            }
        }
    };
});


