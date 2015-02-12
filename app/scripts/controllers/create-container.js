'use strict';

/**
 * @ngdoc function
 * @name dockerUiApp.controller:CreatecontainerCtrl
 * @description
 * # CreatecontainerCtrl
 * Controller of the dockerUiApp
 */
angular.module('dockerUiApp')
    .controller('CreateContainerCtrl', [
        '$scope', 'Docker', '$filter', '$q', '$location', '$modalInstance', 'input',
        function ($scope, Docker, $filter, $q, $location, $modalInstance, input) {
            function formatExposedPort(port, obj) {
                obj = Array.isArray(obj) ? obj[0] : obj;
                var result = [];
                if (obj) {
                    if (obj.HostIp) {
                        result.push(obj.HostIp);
                    }
                    if (obj.HostPort) {
                        result.push(obj.HostPort);
                    }
                }
                result.push(port.split('/')[0]);
                return result.join(':');
            }

            function parseExposedPort(str) {
                var parsed = str.split(':'),
                    result = {},
                    port = parsed.pop(),
                    ptr = {HostPort: parsed.pop()},
                    proto = port.split('/')[1];

                result[port + '/' + (proto || 'tcp')] = [ptr];

                if (parsed.length) {
                    ptr.HostIp = parsed.pop();
                }

                return result;
            }

            $scope.input = input;
            $scope.tmp = {
                ExposedPorts: Object.keys(input.HostConfig.PortBindings).map(function (port) {
                    return formatExposedPort(port, input.HostConfig.PortBindings[port]);
                }),
                Volumes: [],
                Devices: [],
                LxcConf: []
            };
            $scope.images = [];
            $scope.containers = [];
            $scope.containerNames = [];

            Docker.images(function (items) {
                $scope.images = items;
            });

            function parseCMD(command) {
                if (angular.isArray(command)) {
                    return command;
                }
                if (!command) {
                    return [];
                }
                return command.match(/(?:[^\s"']+|"([^"]*)"|'([^']*)')+/g).map(function (string) {
                    var firstChar = string.substr(0, 1),
                        lastChar = string.substr(-1);

                    if ((firstChar === '"' && lastChar === '"') ||
                        (firstChar === '\'' && lastChar === '\'')) {
                        string = string.slice(1, -1);
                    }
                    return string;
                });
            }

            Docker.containers({all: true}, function (containers) {
                $scope.containers = containers;
                $scope.containerNames = containers.map(function (container) {
                    var name = container.Names[0];
                    return name && name.substr(1) || container.Id.substr(0, 12);
                });
            });
            $scope.networkTypes = ['none', 'bridge', 'host', 'container'];
            $scope.restartPolicies = ['none', 'always', 'on-failure'];
            $scope.loadConfig = function loadConfig() {
                Docker.inspectImage({Id: $scope.input.Image[0]}, function (image) {
                    $scope.input = angular.extend({}, image.Config, $scope.input);
                });
            };
            $scope.addExposedPort = function addExposedPort($item) {
                var exposedPort = parseExposedPort($item);
                angular.extend($scope.input.ExposedPorts, exposedPort);
                angular.extend($scope.input.HostConfig.PortBindings, exposedPort);
            };
            $scope.removeExposedPort = function removeExposedPort($item) {
                var exposedPort = Object.keys(parseExposedPort($item))[0];
                delete $scope.input.ExposedPorts[exposedPort];
                delete $scope.input.HostConfig.PortBindings[exposedPort];
            };
            $scope.addDevice = function addDevice($item) {
                var parsed = $item.split(':');
                $scope.input.HostConfig.Devices.push({
                    PathOnHost: parsed.shift(),
                    PathInContainer: parsed.shift(),
                    CgroupPermissions: parsed.shift()
                });
            };
            $scope.removeDevice = function removeDevice($item) {
                var parsed = $item.split(':'),
                    index = -1;
                $scope.input.HostConfig.Devices.some(function (device, i) {
                    if (device.PathOnHost === parsed[0] &&
                        device.PathInContainer === parsed[1] &&
                        device.CgroupPermissions === parsed[2]) {
                        index = i;
                        return true;
                    }
                });
                if (index !== -1) {
                    $scope.input.HostConfig.Devices.splice(index, 1);
                }
            };
            $scope.addVolume = function addVolume($item) {
                var parsed = $item.split(':');
                $scope.input.Volumes[parsed[1] || parsed[0]] = {};
            };
            $scope.removeVolume = function removeVolume($item) {
                var parsed = $item.split(':');
                delete $scope.input.Volumes[parsed[1] || parsed[0]];
            };
            $scope.addLxcConf = function addLxcConf($item) {
                var parsed = $item.split(':');
                $scope.input.HostConfig.LxcConf[parsed[0]] = parsed[1];
            };
            $scope.removeLxcConf = function removeLxcConf($item) {
                var parsed = $item.split(':');
                delete $scope.input.HostConfig.LxcConf[parsed[0]];
            };
            $scope.prev = function prev() {
                angular.element(document.getElementsByClassName('carousel-indicators')[0]).scope().prev();
            };
            $scope.next = function prev() {
                angular.element(document.getElementsByClassName('carousel-indicators')[0]).scope().next();
            };
            $scope.ok = function () {
                var Volumes = {},
                    Container = angular.extend({}, $scope.input);

                Container.Cmd = parseCMD(Container.Cmd);

                if (Container.Volumes && Container.Volumes.length) {
                    Container.Volumes.forEach(function (volume) {
                        var parsed = volume.split(':'); // hostPath:containerPath:permission
                        Volumes[parsed[1]] = {};
                        Container.HostConfig.Binds.push(volume);
                    });
                    Container.Volumes = Volumes;
                }

                Container.Image = Array.isArray(Container.Image) ? Container.Image[0] : Container.Image;
                if (Container.HostConfig.NetworkMode === 'container') {
                    if ($scope.input.NetContainer) {
                        Container.HostConfig.NetworkMode = 'container:' + $scope.input.NetContainer.substr(1);
                    } else {
                        delete Container.HostConfig.NetworkMode;
                    }
                }
                angular.extend(Container, Container.HostConfig);
                console.log(Container);

                Docker.create(Container, function (container) {
                    Docker.start(angular.extend({Id: container.Id}, Container.HostConfig), function () {
                        $location.path('/container/' + container.Id.substr(0, 12));
                        $modalInstance.close(container);
                    });
                });
            };
            $scope.cancel = function () {
                $modalInstance.close();
            };
        }
    ]);
