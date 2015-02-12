'use strict';

angular.module('dockerUiApp').controller('ContainerCtrl', [
    '$scope', '$routeSegment', '$timeout', '$location', 'urlParser',
    'Config', 'Docker', 'Dialogs', 'terminal', 'container',
    function ($scope, $routeSegment, $timeout, $location, urlParser, Config, Docker, Dialogs, tty, container) {
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
                /** @namespace row.Kind */
                return {
                    'warning': !!row.Kind
                };
            },
            maxSize: 5
        };

        function reload() {
            $routeSegment.chain.slice(-1)[0].reload();
        }

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
            if ($scope.containerId && $scope.container.State.Running) {
                Docker.processList({Id: $scope.containerId, 'ps_args': 'axwuu'}, function (processes) {
                    $scope.processes = processes;
                });
            }

            if ($scope.activeTab[tab] && $scope.active) {
                $timeout($scope.processList.bind($scope, tab), 2000);
            }
        };

        $scope.logs = function () {
            var logTerminalElement = document.getElementById('logTerminal');
            if (!((logTerminalElement && $scope.containerId) ||
                $scope.Console.logs.terminal) || $scope.Console.logs.terminal) {
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
            var connection = $scope.Console.logs.connection = Docker.logs({
                ID: $scope.containerId,
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

        $scope.clone = function () {
            var config = angular.extend({}, $scope.container.Config, {HostConfig: $scope.container.HostConfig});
            delete config.Id;
            if (config.Image.indexOf(':') === -1) {
                config.Image += ':latest';
            }
            Dialogs.createContainer(config);
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
            var parsed = urlParser(Config.host),
                termContainer = document.getElementById('terminal'),
                url;
            url = (parsed.protocol === 'https:' ? 'wss' : 'ws') + '://' + parsed.host + '/containers/' +
                $scope.containerId + '/attach/ws?logs=0&stream=1&stdout=1&stderr=1&stdin=1';

            termContainer.innerHTML = '';
            $scope.Console.terminal = tty(termContainer, url);
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
