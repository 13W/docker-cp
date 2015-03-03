'use strict';

angular.module('dockerUiApp').controller('ContainerCtrl', [
    '$scope', '$routeSegment', '$timeout', '$location', 'urlParser',
    'Config', 'Docker', 'Dialogs', 'terminal', 'container',
    function ($scope, $routeSegment, $timeout, $location, urlParser, Config, Docker, Dialogs, tty, container) {
        $scope.active = true;
        $scope.container = container;
        var containerId = container.Id.slice(0, 12),
            logs = {}, terminal;
        $scope.changes = [];
        $scope.changesOpts = {
            colDef: [
                {name: 'Filename', field: 'Path'}
            ],
            rowClass: function (row) {
                /** @namespace row.Kind */
                return {
                    'warning': !!row.Kind
                };
            },
            maxSize: 5
        };

        function getWindowSize(win) {
            var w = win.window,
                d = win.document,
                e = d.documentElement,
                g = d.getElementsByTagName('body')[0],
                width = w.innerWidth || e.clientWidth || g.clientWidth,
                height = w.innerHeight || e.clientHeight || g.clientHeight;

            return {width: width, height: height};
        }

        function setWindowSize(win, width, height) {
            var w = win.window,
                d = win.document,
                e = d.documentElement,
                g = d.getElementsByTagName('body')[0];
            w.innerWidth = e.clientWidth = g.clientWidth = width;
            w.innerHeight = e.clientHeight = g.clientHeight = height;
        }

        $scope.activeTab = {};
        $scope.processList = function (tab) {
            /** @namespace $scope.container.State */
            /** @namespace $scope.container.State.Running */
            if (containerId && $scope.container.State.Running) {
                Docker.processList({Id: containerId, 'ps_args': 'axwuu'}, function (processes) {
                    $scope.processes = processes;
                });
            }

            if ($scope.activeTab[tab] && $scope.active) {
                $timeout($scope.processList.bind($scope, tab), 2000);
            }
        };

        $scope.logs = function () {
            var logTerminalElement = document.getElementById('logTerminal');
            if (!((logTerminalElement && containerId) ||
                logs.terminal) || logs.terminal) {
                return;
            }
            //noinspection JSLint
            var terminal = logs.terminal = new Terminal({
                cols: 0,
                rows: 0,
                useStyle: true,
                screenKeys: true,
                cursorBlink: false
            });
            terminal.open(logTerminalElement);
            //noinspection JSLint
            var connection = logs.connection = Docker.logs({
                ID: containerId,
                stdout: 1,
                stderr: 1,
                tail: 100
            }, function (data) {
                if (logTerminalElement) {
                    data.split('\n').forEach(function (data) {
                        terminal.write(data + '\r\n');
                    });
                } else {
                    connection.abort();
                    terminal.destroy();
                    logs.terminal = false;
                }
            });
        };

        $scope.start = function () {
            if (containerId) {
                Docker.start({Id: containerId}, $scope.$reload);
            }
        };

        $scope.stop = function () {
            if (containerId) {
                Docker.stop({Id: containerId}, $scope.$reload);
            }
        };

        $scope.restart = function () {
            if (containerId) {
                Docker.restart({Id: containerId}, $scope.$reload);
            }
        };

        $scope.kill = function () {
            if (containerId) {
                Docker.kill({Id: containerId}, $scope.$reload);
            }
        };

        $scope.destroy = function () {
            if (containerId) {
                Docker.destroy({Id: containerId}).then(function (complete) {
                    if (complete) {
                        $location.path('/containers');
                    }
                });
            }
        };

        $scope.clone = function () {
            var config = angular.extend({}, $scope.container.Config, {HostConfig: $scope.container.HostConfig});
            delete config.Id;
            if (config.Image.indexOf(':') === -1) {
                config.Image += ':latest';
            }
            Dialogs.createContainer(config);
        };

        $scope.commit = function () {
            if (containerId) {
                Docker.commit($scope.container).then(function (image) {
                    if (image) {
                        $location.path('/image/' + image.Id.slice(0, 12));
                    }
                });
            }
        };

        $scope.attachConsole = function () {
            if (containerId && terminal) {
                return;
            }
            var parsed = urlParser(Config.host),
                termContainer = document.getElementById('terminal'),
                url;
            url = (parsed.protocol === 'https:' ? 'wss' : 'ws') + '://' + parsed.host + '/containers/' +
                containerId + '/attach/ws?logs=0&stream=1&stdout=1&stderr=1&stdin=1';

            termContainer.innerHTML = '';
            terminal = tty(termContainer, url);
        };

        $scope.openInNewWindow = function () {
            var name = 'Terminal: ' + $scope.container.Name,
                win = window.open('about:blank', name, 'width=540, height=322, ' +
                    'location=no, menubar=no, resizable=no, scrollbars=no, status=no, titlebar=no, toolbar=no');
            win.document.body.style.margin = 0;
            win.document.body.style.padding = 0;
            win.document.head.innerHTML = '<title>' + name + '</title>';

            if (!terminal) {
                return;
            }
            terminal = tty(win.document.body, terminal.address);
            win.onbeforeunload = function () {
                terminal.destroy();
            };

            var currentSize = getWindowSize(win);

            win.window.onresize = function () {
                var size = getWindowSize(win),
                    x = Math.floor(size.width / 6.70),
                    y = Math.floor(size.height / 13.05);
                Docker.resize({Id: $scope.container.Id, h: y, w: x}).then(function () {
                    currentSize = size;
                    terminal.tty.resize(x, y);
                }, function () {
                    setWindowSize(win, currentSize.width, currentSize.height);
                    console.log(arguments);
                });
            };
        };

        $scope.getChanges = function () {
            Docker.changes({Id: containerId}, function (changes) {
                $scope.changes = changes;
            });
        };

        $scope.createAs = function () {
            Docker.createContainer($scope.container.Config).then(function (response) {
                if (response) {
                    $location.path('/container/' + response.Id.slice(0, 12));
                }
            });
        };

        $scope.export = function () {
            Docker.export({Id: containerId});
        };

        var i, prevRx, prevTx, prevCpu, prevSystem, gaugeData = [
            ['Label', 'Value'],
            ['CPU', 0],
            ['Memory', 0]
        ];

        $scope.systemChart = {
            type: 'Gauge',
            options: {
                animation: {
                    duration: 1000,
                    easing: 'in'
                },
                width: 400, height: 120,
                redFrom: 90, redTo: 100,
                yellowFrom:75, yellowTo: 90,
                minorTicks: 5
            },
            data: gaugeData
        };

        $scope.networkChart = {
            type: 'LineChart',
            data: {
                cols: [
                    {id: 'date', label: 'Date', type: 'date'},
                    {id: 'rx', label: 'Received', type: 'number'},
                    {id: 'tx', label: 'Transmitted', type: 'number'}
                ],
                rows: [],
                options: {
                    title: 'Network traffic',
                    isStacked: true,
                    fill: 20,
                    displayExactValues: true,
                    vAxis: {
                        title: 'Megabytes',
                        gridlines: {
                            count: 10
                        }
                    },
                    hAxis: {
                        title: 'Date'
                    },
                    tooltip: {
                        isHtml: false
                    },
                    view: {}
                }
            }
        };

        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        function calculateCpuPercent(stats) {
            if (!(prevCpu && prevSystem)) {
                prevCpu = stats.cpu_stats.cpu_usage.total_usage;
                prevSystem = stats.cpu_stats.system_cpu_usage;
                return 0;
            }
            var cpuPercent, cpuDelta, systemDelta;
            if (prevCpu && prevSystem) {
                cpuPercent = 0;
                cpuDelta = stats.cpu_stats.cpu_usage.total_usage - prevCpu;
                systemDelta = stats.cpu_stats.system_cpu_usage - prevSystem;
            }

            prevCpu = stats.cpu_stats.cpu_usage.total_usage;
            prevSystem = stats.cpu_stats.system_cpu_usage;

            if (cpuDelta > 0 && systemDelta > 0) {
                cpuPercent = (cpuDelta / systemDelta) * stats.cpu_stats.cpu_usage.percpu_usage.length * 100;
            }

            return cpuPercent;
        }
        for (i = 0; i < 60; i += 1) {
            var chartDate = new Date();
            chartDate.setSeconds(-1 * i);
            $scope.networkChart.data.rows.push({c:[{v: chartDate}, {v: 0}, {v: 0}]});
        }
        var stats = Docker.stats({Id: containerId}, function (stats) {
            stats = Array.isArray(stats) ? stats : [stats];
            stats.forEach(function (stat) {
                var cpuPercent = calculateCpuPercent(stat),
                    memPercent = stat.memory_stats.usage / stat.memory_stats.limit * 100,
                    networkRx = stat.network.rx_bytes / 1024,
                    networkTx = stat.network.tx_bytes / 1024,
                    rows = $scope.networkChart.data.rows;

                gaugeData[1][1] = +cpuPercent.toFixed(2);
                gaugeData[2][1] = +memPercent.toFixed(2);
                //console.info(cpuPercent, memPercent, networkRx, networkTx);
                while (rows.length > 60) {
                    rows.shift();
                }
                rows.push({c:[
                    {v: new Date(stat.read)},
                    {v: prevRx ? networkRx - prevRx : 0},
                    {v: prevTx ? networkTx - prevTx : 0}
                ]});
                prevRx = networkRx;
                prevTx = networkTx;
                $scope.$apply();
            });
        });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers

        function destroy() {
            $scope.active = false;
            $scope.activeTab = {};
            if (logs.connection) {
                logs.connection.abort();
            }
            if (logs.terminal) {
                logs.terminal.destroy();
                logs.terminal = false;
            }
            if (terminal) {
                terminal.destroy();
            }
            if (stats) {
                stats.abort();
            }
        }

        $scope.$on('$destroy', destroy);
        $scope.$on('$routeChangeSuccess', $scope.$reload);
    }]);
