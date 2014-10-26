'use strict';

//noinspection JSLint
if (typeof setImmediate === 'undefined') {
    var setImmediate = setTimeout;
}

angular.module('dockerUiApp').controller('ContainerCtrl', [
    '$scope', '$routeSegment', '$timeout', '$location', 'Config', 'Docker', 'terminal', 'container',
    function ($scope, $routeSegment, $timeout, $location, Config, Docker, tty, container) {
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
                Docker.processList({Id: $scope.containerId, ps_args: 'axwuu'}, function (processList) {
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
                Docker.start({Id: $scope.containerId}, reload);
            }
        };

        $scope.stop = function () {
            if ($scope.containerId) {
                Docker.stop({Id: $scope.containerId}, reload);
            }
        };

        $scope.restart = function () {
            if ($scope.containerId) {
                Docker.restart({Id: $scope.containerId}, reload);
            }
        };

        $scope.kill = function () {
            if ($scope.containerId) {
                Docker.kill({Id: $scope.containerId}, reload);
            }
        };

        $scope.destroy = function () {
            if ($scope.containerId) {
                Docker.destroy({Id: $scope.containerId}).then(function (complete) {
                    if (complete) {
                        $location.path('/containers');
                    }
                });
            }
        };

        $scope.commit = function () {
            if ($scope.containerId) {
                Docker.commit($scope.container).then(function (image) {
                    if (image) {
                        $location.path('/image/' + image.Id.slice(0, 12));
                    }
                });
            }
        };


        $scope.attachConsole = function () {
            if ($scope.containerId && $scope.Console.terminal) {
                return;
            }
            var parser = document.createElement('a'),
                termContainer = angular.element('#terminal'),
                url;
            parser.href = Config.host;
            url = (parser.protocol === 'https:' ? 'wss' : 'ws') + '://' + parser.host + '/containers/' +
                $scope.containerId + '/attach/ws?logs=0&stream=1&stdout=1&stderr=1&stdin=1';

            termContainer.html("");
            $scope.Console.terminal = tty(termContainer[0], url);
        };

        $scope.openInNewWindow = function () {
            var name = 'Terminal: ' + $scope.container.Name,
                win = window.open('about:blank', name, 'width=540, height=322, ' +
                    'location=no, menubar=no, resizable=no, scrollbars=no, status=no, titlebar=no, toolbar=no'),
                terminal;
            win.document.body.style.margin = 0;
            win.document.body.style.padding = 0;
            win.document.head.innerHTML = '<title>' + name + '</title>';
            if (!$scope.Console.terminal) {
                return;
            }
            terminal = tty(win.document.body, $scope.Console.terminal.address);
            win.onbeforeunload = function () {
                terminal.destroy();
            };
        };

        $scope.getChanges = function () {
            Docker.changes({Id: $scope.containerId}, function (changes) {
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
            Docker.export({Id: $scope.containerId});
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
            if ($scope.Console.terminal) {
                $scope.Console.terminal.destroy();
            }
        }

        $scope.$on('$destroy', destroy);
        $scope.$on('$routeChangeSuccess', function () {
            $routeSegment.chain.slice(-1)[0].reload();
        });
    }]);
