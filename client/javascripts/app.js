var app = angular.module('rpi3', ['n3-line-chart']);

app.service('dataService', function($http) {
    var getData = function() {
        return $http.get('/db/env_sensors').then(function(response) {
            return response;
        });
    };

    return { getData: getData };
});

app.service('loadAvgService', function ($http) {
    var getLoadAvg = function() {
        return $http.get('/db/loadavg').then(function(response) {
            return response;
        });
    };
    return { getLoadAvg: getLoadAvg };
});

app.controller('rpi3Ctrl', function($scope, dataService, loadAvgService) {
    $scope.data0 = [];
    $scope.isLoaded = false;
    dataService.getData().then(function(response) {
        $scope.data0 = response;
        $scope.data0.data.forEach(function(row) {
            row.timestamp = new Date(row.timestamp);
        });
        $scope.isLoaded = true;
    }, function() {
        $scope.error = 'Unable to GET data';
    });

    $scope.data1 = [];
    $scope.isLoaded2 = false;
    loadAvgService.getLoadAvg().then(function(response) {
        $scope.data1 = response;
        $scope.data1.data.forEach(function(row) {
            row.timestamp = new Date(row.timestamp);
        });
        $scope.isLoaded2 = true;
    }, function() {
        $scope.error = 'Unable to GET data';
    });

    $scope.options0 = {
        zoom: { x: true, y: false, key: 'shiftKey' },
        margin: {top: 20, right: 50, left: 50, bottom: 50},
        series: [
            {
                axes: 'y',
                dataset: 'data',
                key: 'temperature',
                label: 'Fahrenheit',
                color: '#ff2222',
                thickness: '5px',
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
                //ticksRotate: 30, not available in v2 yet
                tickFormat: d3.time.format('%x')
            }
        }
    };

    $scope.options1 = {
        zoom: { x: true, y: false, key: 'shiftKey' },
        margin: {top: 20, right: 50, left: 50, bottom: 50},
        series: [
           {
               axes: 'y',
               dataset: 'data',
               key: 'humidity',
               label: 'Percent',
               color: '#225522',
               thickness: '5px',
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
                //ticksRotate: 30, not available in v2 yet
                tickFormat: d3.time.format('%x')
            }
        }
    };

    $scope.options2 = {
        zoom: { x: true, y: false, key: 'shiftKey' },
        margin: {top: 20, right: 50, left: 50, bottom: 50},
        series: [
           {
               axes: 'y',
               dataset: 'data',
               key: 'pressure',
               label: 'milliBars',
               color: '#2222ff',
               thickness: '5px',
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
                //ticksRotate: 30, not available in v2 yet
                tickFormat: d3.time.format('%x')
            }
        }
    };

    $scope.options3 = {
        zoom: { x: true, y: false, key: 'shiftKey' },
        margin: {top: 20, right: 50, left: 50, bottom: 50},
        series: [
           {
               axes: 'y',
               dataset: 'data',
               key: 'la1',
               label: '1 minute',
               color: '#ff2222',
               thickness: '5px',
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
               thickness: '5px',
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
               thickness: '5px',
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
                //ticksRotate: 30, not available in v2 yet
                tickFormat: d3.time.format('%x')
            }
        }
    };

});


