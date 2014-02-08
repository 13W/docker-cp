'use strict';

angular.module('dockerUiApp').controller('ContainerCtrl', [
    '$scope', '$route', '$timeout', '$location', 'Docker', 'container', function ($scope, $route, $timeout, $location, Docker, container) {
        $scope.active = true;
        $scope.container = container;
        $scope.containerId = $route.current.params.containerId;

        $scope.getContainer = function () {
            Docker.inspect({p1: $scope.containerId}, function (container) {
                $scope.container = container;
            });
        };
        $scope.activeTab = {};
        $scope.processList = function (tab) {
            if ($scope.containerId && $scope.container.State.Running) {
                Docker.processList({ID: $scope.containerId, ps_args: 'axwuu'}, function (processList) {
                    $scope.container.ps = processList;
                });
            }
            if ($scope.activeTab[tab] && $scope.active) {
                $timeout($scope.processList.bind($scope, tab), 2000);
            }
        };
        
        $scope.start = function () {
            if ($scope.containerId) {
                Docker.start({ID: $scope.containerId}, function () {
                    $scope.getContainer();
                });
            }
        };
        
        $scope.stop = function () {
            if ($scope.containerId) {
                Docker.stop({ID: $scope.containerId}, function () {
                    $scope.getContainer();
                });
            }
        };
        
        $scope.restart = function () {
            if ($scope.containerId) {
                Docker.restart({ID: $scope.containerId}, function () {
                    $scope.getContainer();
                });
            }
        };
        
        $scope.kill = function () {
            if ($scope.containerId) {
                Docker.kill({ID: $scope.containerId}, function () {
                    $scope.getContainer();
                });
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
        $scope.Console = {};
        $scope.attachConsole = function () {
            if ($scope.containerId) {
                if (!$scope.Console.socket) {
                    $scope.Console.socket = new WebSocket('ws://localhost:4243/containers/' + $scope.containerId + '/attach/ws?logs=0&stream=1&stdout=1&stderr=1&stdin=1');

                    $scope.Console.terminal = new Terminal({
                        cols: 0,
                        rows: 0,
                        useStyle: true,
                        screenKeys: true
                    });

                    $scope.Console.socket.onopen = function() {
                        monitor();
                    };

                    $scope.Console.socket.onmessage = function(event) {
                        $scope.Console.terminal.write(event.data);
                    };

                    $scope.Console.socket.onclose = function() {
                        $scope.Console.terminal.destroy();
                    };

                    $scope.Console.terminal.on('data', function(data) {
                        $scope.Console.socket.send(data);
                    });

                    angular.element('#terminal').html("");
                    $scope.Console.terminal.open(angular.element('#terminal')[0]);
                }
            }
        };

        $scope.createAs = function () {
            Docker.createContainer($scope.container.Config, function (response) {
                if (response) {
                    $location.path('/container/' + response.Id.slice(0, 12));
                }
            });
       };

        $scope.$on('$destroy', function () {
            $scope.active = false;
            $scope.activeTab = {};
            if ($scope.Console.socket) {
                $scope.Console.socket.close();
            }
            if ($scope.Console.terminal) {
                $scope.Console.terminal.destroy();
            }
        })
    }]);
