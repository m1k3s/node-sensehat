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

// only retrieve 5 days (480 rows) for display
app.controller('rpi3Ctrl', function($scope, dataService, loadAvgService, netstatsService) {
    $scope.data0 = [];
    $scope.isLoaded0 = false;
    dataService.getData(480).then(function(response) {
        $scope.data0 = response;
        $scope.data0.data.forEach(function(row) {
            row.timestamp = new Date(row.timestamp);
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
            if (row.tx_rate < 1.0) {row.tx_rate = 1.0;}
            if (row.rx_rate < 1.0) {row.rx_rate = 1.0;}
        });
        $scope.isLoaded2 = true;
    }, function() {
        $scope.error = 'Unable to GET netstats data';
    });

    $scope.options0 = {
        zoom: { x: true, y: false },
        pan: {x: true, y: false, y2: false },
        margin: {top: 20, right: 50, left: 50, bottom: 50},
        series: [
            {
                axes: 'y',
                dataset: 'data',
                key: 'temperature',
                label: 'Fahrenheit',
                color: '#ff4500',
                type: ['line', 'area'],
                id: 'Series0',
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

    $scope.options1 = {
        zoom: { x: true, y: false },
        pan: {x: true, y: false, y2: false },
        margin: {top: 20, right: 50, left: 50, bottom: 50},
        series: [
            {
                axes: 'y',
                dataset: 'data',
                key: 'humidity',
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
                        value: s.row.y1,
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
                label: 'milliBars',
                color: '#0000cd',
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
                            value: s.row.y1,
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
               label: '15 minute',
               color: '#2222ff',
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
               label: 'TX Bytes/15 minutes',
               color: '#ff2222',
               type: ['line', 'area'],
               id: 'Series6',
               interpolation: {mode: 'cardinal', tension: 0.7}
           },
           {
               axes: 'y',
               dataset: 'data',
               key: 'rx_rate',
               label: 'RX Bytes/15 minutes',
               color: '#2255ff',
               type: ['line', 'area'],
               id: 'Series7',
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
            },
            y: {
                type: 'log',
                min: 100
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

});


