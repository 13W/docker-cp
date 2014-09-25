'use strict';

angular.module('dockerUiApp').controller('ContainerCtrl', [
    '$scope', '$routeSegment', '$timeout', '$location', 'Config', 'Docker', 'container',
    function ($scope, $routeSegment, $timeout, $location, Config, Docker, container) {
        $scope.active = true;
        $scope.container = container;
        $scope.containerId = container.Id.slice(0, 12);
        $scope.changes = [];
        $scope.Console = {logs: {terminal: null, connection: null}};
        $scope.changesOpts = {
            colDef: [
                {name: 'Filename', field: 'Path'}
            ],
            rowClass: function (row) {
                return {
                    'warning': !!row.Kind
                };
            },
            maxSize: 5
        };
        function reload() {
            $routeSegment.chain.slice(-1)[0].reload();
        }

        $scope.activeTab = {};
        $scope.processList = function (tab) {
            if ($scope.containerId && $scope.container.State.Running) {
                Docker.processList({ID: $scope.containerId, ps_args: 'axwuu'}, function (processList) {
                    $scope.processList = processList;
                });
            }

            if ($scope.activeTab[tab] && $scope.active) {
                $timeout($scope.processList.bind($scope, tab), 2000);
            }
        };

        $scope.logs = function () {
            var logTerminalElement = angular.element('#logTerminal')[0];
            if (!((logTerminalElement && $scope.containerId) || $scope.Console.logs.terminal) || $scope.Console.logs.terminal) {
                return;
            }
            //noinspection JSLint
            var terminal = $scope.Console.logs.terminal = new Terminal({
                cols: 0,
                rows: 0,
                useStyle: true,
                screenKeys: true,
                cursorBlink: false
            });
            terminal.open(logTerminalElement);
            //noinspection JSLint
            var connection = $scope.Console.logs.connection = Docker.logs({ID: $scope.containerId, stdout:1, stderr: 1, tail: 100}, function (data) {
                if (logTerminalElement) {
                    data.split('\n').forEach(function (data) {
                        terminal.write(data + '\r\n');
                    });
                } else {
                    connection.abort();
                    terminal.destroy();
                    $scope.Console.logs.terminal = false;
                }
            });
        };

        $scope.start = function () {
            if ($scope.containerId) {
                Docker.start({ID: $scope.containerId}, reload);
            }
        };

        $scope.stop = function () {
            if ($scope.containerId) {
                Docker.stop({ID: $scope.containerId}, reload);
            }
        };

        $scope.restart = function () {
            if ($scope.containerId) {
                Docker.restart({ID: $scope.containerId}, reload);
            }
        };

        $scope.kill = function () {
            if ($scope.containerId) {
                Docker.kill({ID: $scope.containerId}, reload);
            }
        };

        $scope.destroy = function () {
            if ($scope.containerId) {
                Docker.destroy({ID: $scope.containerId}, function (complete) {
                    if (complete) {
                        $location.path('/containers');
                    }
                });
            }
        };

        $scope.commit = function () {
            if ($scope.containerId) {
                Docker.commit($scope.container, function (image) {
                    if (image) {
                        $location.path('/image/' + image.Id.slice(0, 12));
                    }
                });
            }
        };

        function monitor() {
            if ($scope.active) {
                if ($scope.Console.socket.readyState !== 1) {
                    delete $scope.Console.socket;
                    $scope.attachConsole();
                } else {
                    $timeout(monitor, 1000);
                }
            }
        }

        $scope.attachConsole = function () {
            if ($scope.containerId) {
                if (!$scope.Console.socket) {
                    var parser = document.createElement('a');
                    parser.href = Config.host;

                    $scope.Console.socket = new WebSocket((parser.protocol === 'https:' ? 'wss' : 'ws') + '://' + parser.host + '/containers/' +
                        $scope.containerId + '/attach/ws?logs=0&stream=1&stdout=1&stderr=1&stdin=1');

                    $scope.Console.terminal = new Terminal({
                        cols: 0,
                        rows: 0,
                        useStyle: true,
                        screenKeys: true
                    });

                    $scope.Console.socket.onopen = function () {
                        monitor();
                    };

                    $scope.Console.socket.onmessage = function (event) {
                        $scope.Console.terminal.write(event.data);
                    };

                    $scope.Console.socket.onclose = function () {
                        $scope.Console.terminal.destroy();
                    };

                    $scope.Console.terminal.on('data', function (data) {
                        $scope.Console.socket.send(data);
                    });

                    angular.element('#terminal').html("");
                    $scope.Console.terminal.open(angular.element('#terminal')[0]);
                }
            }
        };

        $scope.getChanges = function () {
            Docker.changes({ID: $scope.containerId}, function (changes) {
                $scope.changes = changes;
            });
        };

        $scope.createAs = function () {
            Docker.createContainer($scope.container.Config, function (response) {
                if (response) {
                    $location.path('/container/' + response.Id.slice(0, 12));
                }
            });
        };

        $scope.export = function () {
            Docker.export({ID: $scope.containerId});
        };

        function destroy() {
            $scope.active = false;
            $scope.activeTab = {};
            if ($scope.Console.logs.connection) {
                $scope.Console.logs.connection.abort();
            }
            if ($scope.Console.logs.terminal) {
                $scope.Console.logs.terminal.destroy();
                $scope.Console.logs.terminal = false;
            }
            if ($scope.Console.socket) {
                $scope.Console.socket.close();
            }
            if ($scope.Console.terminal) {
                $scope.Console.terminal.destroy();
            }
        }

        $scope.$on('$destroy', destroy);
        $scope.$on('$routeChangeSuccess', function () {
            $routeSegment.chain.slice(-1)[0].reload();
        });
    }]);
