var app = angular.module('rpi3', ['n3-line-chart']);

app.service('dataService', function($http) {
    var getData = function(rows) {
        if (rows > 0) {
            return $http.get('/db/env_sensors/' + rows).then(function(response) {
                return response;
            });
        } else {
            return $http.get('/db/env_sensors').then(function(response) {
                return response;
            });
        }
    };

    return { getData: getData };
});

app.service('loadAvgService', function ($http) {
    var getLoadAvg = function(rows) {
        if (rows > 0) { 
            return $http.get('/db/loadavg/' + rows).then(function(response) {
                return response;
            });
        } else {
            return $http.get('/db/loadavg').then(function(response) {
                return response;
            });
        }
    };
    return { getLoadAvg: getLoadAvg };
});

app.service('netstatsService', function ($http) {
    var getNetStats = function(rows) {
        if (rows > 0) {
            return $http.get('/db/netstats/' + rows).then(function(response) {
                return response;
            });
        } else {
            return $http.get('/db/netstats').then(function(response) {
                return response;
            });
        }
    };
    return { getNetStats: getNetStats };
});

app.service('diskstatsService', function ($http) {
    var getDiskStats = function(rows) {
        if (rows > 0) {
            return $http.get('/db/diskstats/' + rows).then(function(response) {
                return response;
            });
        } else {
            return $http.get('/db/diskstats').then(function(response) {
                return response;
            });
        }
    };
    return { getDiskStats: getDiskStats };
});

// only retrieve 5 days (480 rows) for display
app.controller('rpi3Ctrl', function($scope, dataService, loadAvgService, netstatsService, diskstatsService) {
    $scope.data0 = [];
    $scope.isLoaded0 = false;
    dataService.getData(480).then(function(response) {
        $scope.data0 = response;
        $scope.data0.data.forEach(function(row) {
            row.timestamp = new Date(row.timestamp);
            // temp is now celsius in the db, convert the old fahrenheit to celsius for now
            if (row.calibrated_temp > 60.0) {
                row.calibrated_temp = ((row.calibrated_temp - 32.0) * 0.55556).toFixed(1);
            }
            if (row.cpu_temp > 60.0) {
                row.cpu_temp = ((row.cpu_temp - 32.0) * 0.55556).toFixed(1);
            }
        });
        $scope.isLoaded0 = true;
    }, function() {
        $scope.error = 'Unable to GET environmental data';
    });

    $scope.data1 = [];
    $scope.isLoaded1 = false;
    loadAvgService.getLoadAvg(480).then(function(response) {
        $scope.data1 = response;
        $scope.data1.data.forEach(function(row) {
            row.timestamp = new Date(row.timestamp);
        });
        $scope.isLoaded1 = true;
    }, function() {
        $scope.error = 'Unable to GET loadavg data';
    });

    $scope.data2 = [];
    $scope.isLoaded2 = false;
    netstatsService.getNetStats(480).then(function(response) {
        $scope.data2 = response;
        $scope.data2.data.forEach(function(row) {
            row.timestamp = new Date(row.timestamp);
            // this data plotted on log axis, make sure 
            // there are no zero | negative data points
            if (row.tx_rate < 0.1) {row.tx_rate = 0.1;}
            if (row.rx_rate < 0.1) {row.rx_rate = 0.1;}
        });
        $scope.isLoaded2 = true;
    }, function() {
        $scope.error = 'Unable to GET netstats data';
    });

    $scope.data3 = [];
    $scope.isLoaded3 = false;
    diskstatsService.getDiskStats(480).then(function(response) {
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

    $scope.options0 = {
        zoom: { x: true, y: false },
        pan: {x: true, y: false, y2: false },
        margin: {top: 20, right: 50, left: 50, bottom: 50},
        series: [
            {
                axes: 'y',
                dataset: 'data',
                key: 'calibrated_temp',
                defined: function(value) {
                    return value.y1 != undefined;
                },
                label: 'Calibrated',
                color: '#ff0000',
                type: ['line', 'area'],
                id: 'Series0',
                interpolation: {mode: 'cardinal', tension: 0.7}
            },
            {
                axes: 'y',
                dataset: 'data',
                key: 'cpu_temp',
                defined: function(value) {
                    return value.y1 != undefined;
                },
                label: 'CPU',
                color: '#00ff00',
                type: ['line', 'area'],
                id: 'Series0a',
                interpolation: {mode: 'cardinal', tension: 0.7}
            },
            {
                axes: 'y',
                dataset: 'data',
                key: 'raw_temp',
                defined: function(value) {
                    return value.y1 != undefined;
                },
                label: 'Raw',
                color: '#0000ff',
                type: ['line', 'area'],
                id: 'Series0b',
                interpolation: {mode: 'cardinal', tension: 0.7}
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
                key: 'humidity',
                defined: function(value) {
                    return value.y1 != undefined;
                },
                label: 'Percent',
                color: '#00cd00',
                type: ['line', 'area'],
                id: 'Series1',
                interpolation: {mode: 'cardinal', tension: 0.7}
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
            return {
                abscissas: d[0].row.x.toTimeString(),
                rows: d.map(function(s) {
                    return {
                        label: s.series.label,
                        value: s.row.y1 + '%',
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
        margin: {top: 20, right: 50, left: 50, bottom: 50},
        series: [
            {   
                axes: 'y',
                dataset: 'data',
                key: 'pressure',
                defined: function(value) {
                    return value.y1 != undefined;
                },
                label: 'milliBars',
                color: '#1e90ff',
                type: ['line', 'area'],
                id: 'Series2',
                interpolation: {mode: 'cardinal', tension: 0.7}
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
                            value: s.row.y1 + ' milliBars',
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
                defined: function(value) {
                     return value.y1 != undefined;
                },
                label: '1 minute',
                color: '#ff2222',
                type: ['line', 'area'],
                id: 'Series3',
                interpolation: {mode: 'cardinal', tension: 0.7}
            },
            {
                axes: 'y',
                dataset: 'data',
                key: 'la5',
                defined: function(value) {
                     return value.y1 != undefined;
                },
                label: '5 minute',
                color: '#22ff22',
                type: ['line', 'area'],
                id: 'Series4',
                interpolation: {mode: 'cardinal', tension: 0.7}
            },
            {
                axes: 'y',
                dataset: 'data',
                key: 'la15',
                defined: function(value) {
                     return value.y1 != undefined;
                },
                label: '15 minute',
                color: '#4876ff',
                type: ['line', 'area'],
                id: 'Series5',
                interpolation: {mode: 'cardinal', tension: 0.7}
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
               key: 'tx_rate',
               defined: function(value) {
                    return value.y1 != undefined;
               },
               label: 'TX Bytes/15 minutes',
               color: '#20b2aa',
               type: ['line', 'area'],
               id: 'Series6',
               interpolation: {mode: 'step'}
           },
           {
               axes: 'y',
               dataset: 'data',
               key: 'rx_rate',
               defined: function(value) {
                    return value.y1 != undefined;
               },
               label: 'RX Bytes/15 minutes',
               color: '#e066ff',
               type: ['line', 'area'],
               id: 'Series7',
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
                min: 1
            }
        },
        tooltipHook: function(d) {
            if (d) {
                return {
                    abscissas: 'eth0 ' + d[0].row.x.toTimeString(),
                    rows: d.map(function(s) {
                        let n = parseInt(s.row.y1);
                        let valueLabel = (n >= 1000000 ? (n / 1048576).toFixed(2) + ' MBytes' : n < 1000 ? n.toFixed(2) + ' Bytes': (n / 1024).toFixed(2) + ' KBytes');
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

    $scope.options5 = {
        zoom: { x: true, y: false },
        pan: {x: true, y: false, y2: false },
        margin: {top: 20, right: 50, left: 50, bottom: 50},
        series: [
           {
               axes: 'y',
               dataset: 'data',
               key: 'wbytes',
               defined: function(value) {
                    return value.y1 != undefined;
               },
               label: 'Write Bytes/15 minutes',
               color: '#7ccd7c',
               type: ['line', 'area'],
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
               type: ['line', 'area'],
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
                min: 100
            }
        },
        tooltipHook: function(d) {
            if (d) {
                return {
                    abscissas: 'sda1 ' + d[0].row.x.toTimeString(),
                    rows: d.map(function(s) {
                        let n = parseInt(s.row.y1);
                        let valueLabel = (n >= 1000000 ? (n / 1048576).toFixed(2) + ' MBytes' : n < 1000 ? n.toFixed(2) + ' Bytes': (n / 1024).toFixed(2) + ' KBytes');
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
});


