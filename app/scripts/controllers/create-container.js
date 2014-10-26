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
        '$scope', 'Docker', '$filter', '$q', '$modalInstance', 'input',
        function ($scope, Docker, $filter, $q, $modalInstance, input) {
            $scope.input = input;
            $scope.images = [];
            $scope.containers = [];

            function tagsToArray(tags) {
                return (tags || [])
                    .map(function (tag) {
                        return tag.text;
                    })
                    .filter(function (value) {
                        return !!value;
                    });
            }

            function filter(array, term) {
                return $filter('filter')(array, term);
            }

            $scope.getImages = function (term) {
                var def = $q.defer(),
                    promise = def.promise,
                    images;
                if (!$scope.images.length) {
                    promise = Docker.images(function (items) {
                        images = items.map(function (image) {
                            /** @namespace image.RepoTags */
                            var name = image.RepoTags.slice(-1)[0];
                            return name === '<none>:<none>' ? image.Id.substr(0, 12) : name;
                        });
                        $scope.images = filter(images, term);
                    });
                } else {
                    def.resolve(filter($scope.images, term));
                }
                return promise;
            };

            $scope.getContainer = function (term) {
                var def = $q.defer(),
                    promise = def.promise;

                if (!$scope.containers.length) {
                    promise = Docker.containers({all: true}, function (containers) {
                        $scope.containers = containers.map(function (container) {
                            /** @namespace container.Names */
                            return container.Names[0].substr(1);
                        });
                        return filter($scope.containers, term);
                    });
                } else {
                    def.resolve(filter($scope.containers, term));
                }

                return promise;
            };

            $scope.ok = function () {
                var Volumes = {}, PortBindings = {}, Binds = [], Container = angular.extend({}, $scope.input);
                Container.Cmd = Container.Cmd || '';
                Container.Cmd = (Container.Cmd.match(/(?:[^\s"]+|"[^"]*")+/g) || []).map(function (string) {
                    var firstChar = string.substr(0, 1),
                        lastChar = string.substr(-1);

                    //noinspection JSLint
                    if ((firstChar === '"' && lastChar === '"' && firstChar === lastChar) ||
                        (firstChar === "'" && lastChar === "'" && firstChar === lastChar)) {
                        string = string.slice(1, -1);
                    }

                    return string;
                });

                ['Env', 'Dns', 'ExposedPorts', 'PortSpecs', 'Volumes', 'Links'].forEach(function (prop) {
                    if (Array.isArray(Container[prop])) {
                        Container[prop] = tagsToArray(Container[prop]);
                    }
                });

                if (!Container.VolumesFrom.length) {
                    delete Container.VolumesFrom;
                }
                if (!Container.Volumes.length) {
                    delete Container.Volumes;
                } else {
                    Container.Volumes.forEach(function (volume) {
                        var parsed = volume.split(':'); // hostPath:containerPath:permission
                        Volumes[parsed[1]] = {};
                        Binds.push(volume);
                    });
                    Container.Volumes = Volumes;
                }

                if (Container.ExposedPorts.length) {
                    Container.ExposedPorts.forEach(function (record) {
                        record = record.split(':').reverse();
                        var containerPort = record[0] + '/tcp',
                            hostPort = {"HostPort": record[1] || record[0]},
                            hostIp = {"HostIp": record[2]};
                        PortBindings[containerPort] = [angular.extend({}, hostIp, hostPort)];
                    });
                }
                Docker.create(Container, function (container) {
                    Docker.start({
                        Id: container.Id,
                        Links: Container.Links,
                        LxcConf: Container.LxcConf,
                        Dns: Container.Dns,
                        VolumesFrom: Container.VolumesFrom,
                        Binds: Binds,
                        PortBindings: PortBindings
                    }, function () {
                        $modalInstance.close(container);
                    });
                });
            };
            $scope.close = $modalInstance.dismiss.bind($modalInstance);
        }
    ]);
