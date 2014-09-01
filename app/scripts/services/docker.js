'use strict';

angular.module('dockerUiApp').service('Docker', [
    '$rootScope', '$q', '$filter', 'http', '$sce', 'stream', '$modal', 'Config', function Docker($rootScope, $q, $filter, http, $sce, stream, $modal, Config) {
        function Docker() {
            if (!(this instanceof Docker)) {
                return new Docker();
            }
            
            if (this.servers[Config.host]) {
                return this.servers[Config.host];
            }
            
            this.servers[Config.host] = this;
            return this;
        }

        //noinspection JSAccessibilityCheck
        Docker.prototype.servers = {};

        //noinspection JSAccessibilityCheck
        Docker.prototype.client = function () {
            //noinspection JSPotentiallyInvalidUsageOfThis
            return this.servers[Config.host];
        };
        
        http.config({
            url: Config.host + '/v1.10/:service/:p1/:p2',
            errorHandler: function (error) {
                debugger;
                $rootScope.alert.value = {type: 'error', msg: error};

            }
        });

        http.createService({
            containers   : {
                method: 'GET',
                params: {
                    service: 'containers',
                    p1     : 'json',
                    size   : '=',
                    all    : '='
                }
            },
            inspect      : {
                method: 'GET',
                params: {
                    service: 'containers',
                    p1     : '@ID',
                    p2     : 'json'
                }
            },
            processList  : {
                method: 'GET',
                params: {
                    service: 'containers',
                    p1     : '@ID',
                    p2     : 'top',
                    ps_args: '='
                }
            },
            create       : {
                method: 'POST',
                params: {
                    service: 'containers',
                    p1     : 'create',
                    name   : '='
                }
            },
            changes      : {
                method: 'GET',
                params: {
                    service: 'containers',
                    p1     : '@ID',
                    p2     : 'changes'
                }
            },
            start        : {
                method: 'POST',
                params: {
                    service: 'containers',
                    p1     : '@ID',
                    p2     : 'start'
                }
            },
            stop         : {
                method: 'POST',
                params: {
                    service: 'containers',
                    p1     : '@ID',
                    p2     : 'stop'
                }
            },
            restart      : {
                method: 'POST',
                params: {
                    service: 'containers',
                    p1     : '@ID',
                    p2     : 'restart'
                }
            },
            kill         : {
                method: 'POST',
                params: {
                    service: 'containers',
                    p1     : '@ID',
                    p2     : 'kill'
                }
            },
            _destroy     : {
                method: 'DELETE',
                params: {
                    service: 'containers',
                    p1     : '@ID'
                }
            },
            _commit      : {
                method: 'POST',
                params: {
                    service  : 'commit',
                    container: '=',
                    repo     : '=',
                    tag      : '=',
                    m        : '=',
                    author   : '=',
                    run      : '='
                }
            },
            export       : {
                method: 'GET',
                target: 'self',
                params: {
                    service: 'containers',
                    p1     : '@ID',
                    p2     : 'export'
                }
            },
            images       : {
                method: 'GET',
                params: {
                    service: 'images',
                    p1     : 'json',
                    all    : '='
                }
            },
            insertToImage: {
                method: 'POST',
                params: {
                    service: 'images',
                    p1     : '@ID',
                    insert : 'insert',
                    path   : '=',
                    url    : '='
                }
            },
            inspectImage : {
                method: 'GET',
                params: {
                    service: 'images',
                    p1     : '@ID',
                    p2     : 'json'
                }
            },
            historyImage : {
                method: 'GET',
                params: {
                    service: 'images',
                    p1     : '@ID',
                    p2     : 'history'
                }
            },
            deleteImage  : {
                method: 'DELETE',
                params: {
                    service: 'images',
                    p1     : '@ID'
                }
            },
            searchImage  : {
                method: 'GET',
                params: {
                    service: 'images',
                    p1     : 'search',
                    term   : '='
                }
            },
            info         : {
                method: 'GET',
                params: {
                    service: 'info'
                }
            },
            version      : {
                method: 'GET',
                params: {
                    service: 'version'
                }
            },
            auth         : {
                method: 'POST',
                params: {
                    service: 'auth'
                },
                error : true
            }
        }, Docker.prototype);
        
        //noinspection JSAccessibilityCheck
        Docker.prototype.createContainer = function (predefined, callback) {
            var self = this,
                defaults = {
                    'Image': 'base',
                    'PortSpecs': [],
                    'ExposedPorts': [],
                    'Env': [],
                    'Dns': ['8.8.8.8', '8.8.4.4'],
                    'Tty': true,
                    'AttachStdin': true,
                    'AttachStdout': true,
                    'AttachStderr': true,
                    'OpenStdin': true,
                    'StdinOnce': true,
                    'Volumes': [],
                    'VolumesFrom': []
                },
                input = angular.extend({}, defaults, predefined);
            $modal.open({
                templateUrl: 'views/create-container.html',
                resolve: {
                    input: function () {
                        return input;
                    }
                },
                controller: ['$scope', '$modalInstance', '$timeout', 'input', function ($scope, $modalInstance, $timeout, input) {
                    $scope.input = input;
                    $scope.images = [];
                    $scope.containers = [];
                    
                    function filter(array, term) {
                        return $filter('filter')(array, term);
                    }
                    
                    $scope.getImage = function (term) {
                        if (!$scope.images.length) {
                            return self.images(function (images) {
                                $scope.images = images.map(function (image) {
                                    /** @namespace image.RepoTags */
                                    return image.RepoTags[0];
                                });
                                return filter($scope.images, term);
                            });
                        } else {
                            var def = $q.defer();
                            def.resolve(filter($scope.images, term));
                            return def.promise;
                        }
                    };
                    
                    $scope.getContainer = function (term) {
                        if (!$scope.containers.length) {
                            return self.containers({all: true}, function (containers) {
                                $scope.containers = containers.map(function (container) {
                                    /** @namespace container.Names */
                                    return container.Names[0].substr(1);
                                });
                                return filter($scope.containers, term);
                            });
                        } else {
                            var def = $q.defer();
                            def.resolve(filter($scope.containers, term));
                            return def.promise;
                        }
                    };
                    
                    $scope.ok = function () {
                        if (!$scope.input.VolumesFrom.length) {
                            delete $scope.input.VolumesFrom;
                        }
                        if (!$scope.input.Volumes.length) {
                            delete $scope.input.Volumes;
                        } else {
                            var Volumes = {}, Binds = [];
                            $scope.input.Volumes.forEach(function (volume) {
                                var parsed = volume.split(':'); // hostPath:containerPath:permission
                                Volumes[parsed[1]] = {};
                                Binds.push(volume);
                            });
                            $scope.input.Volumes = Volumes;
                        }

                        self.create($scope.input, function (response) {
                            $modalInstance.close();
                            self.start({ID: response.Id, Binds: Binds, Cmd: ['/bin/sh']}, function () {
                                callback(response);
                            });
                        });
                    };
                    $scope.close = function () {
                        $modalInstance.close();
                        callback(false);
                    };
                }]
            });
        };
        
        //noinspection JSAccessibilityCheck
        Docker.prototype.destroy = function (instance, callback) {
            var self = this;
            var $modalInstance = $modal.open({
                templateUrl  : 'views/destroy-container.html',
                resolve   : {
                    instance: function () {
                        return instance;
                    }
                },
                controller: ['$scope', function ($scope) {
                    $scope.instance = instance;

                    $scope.ok = function () {
                        self._destroy({ID: instance.ID.slice(0, 12), v: $scope.removeAll}, function () {
                            $modalInstance.close();
                            callback(true);
                        });
                    };
                    $scope.close = function () {
                        $modalInstance.close();
                        callback(false);
                    };
                }]
            });
        };

        //noinspection JSAccessibilityCheck
        Docker.prototype.commit = function (instance, callback) {
            var self = this;
            var $modalInstance = $modal.open({
                templateUrl  : 'views/commit-container.html',
                resolve   : {
                    instance: function () {
                        return instance;
                    }
                },
                controller: ['$scope', function ($scope) {
                    $scope.instance = instance;
                    $scope.input = {
                        repo: instance.Name.substr(1),
                        container: instance.ID.slice(0, 12)
                    };

                    $scope.ok = function () {
                        self._commit($scope.input, function (result) {
                            callback(result);
                            $modalInstance.close();
                        });
                    };
                    $scope.close = function () {
                        $modalInstance.close();
                        callback(false);
                    };
                }]
            });
        };

        //noinspection JSAccessibilityCheck
        Docker.prototype.createImage = function (options, callback) {
            var opts = {
                url: Config.host + '/images/create?' + (options.query || ''),
                method: options.method || 'POST',
                parseStream: true,
                progressHandler: options.progressHandler
            };

            var request = stream.request(opts);
            request.then(callback);
            return request;
        };

        //noinspection JSAccessibilityCheck
        Docker.prototype.events = function (since, progressHandler, callback) {
            var opts = {
                url: Config.host + '/events?' + since || 'since=1',
                method: 'GET',
                parseStream: true,
                progressHandler: progressHandler
            };
            var request = stream.request(opts);
            request.then(callback);
            return request;
        };

        function authDialog(auth, callback) {
            var self = this;
            var $modalInstance = $modal.open({
                templateUrl: 'views/auth.html',
                resolve: {
                    auth: function () {
                        return auth || {};
                    }
                },
                controller: ['$scope', function ($scope) {
                    $scope.auth = auth || {};
                    $scope.login = function () {
                        self.auth($scope.auth, function (response) {
                            if (response.Status === 'Login Succeeded') {
                                callback(null, $scope.auth);
                            } else {
                                callback(new Error(response));
                            }
                        });
                        $modalInstance.close();
                    };
                    $scope.close = function () {
                        $modalInstance.close();
                        callback(false);
                    };
                }]
            });
        }

        //noinspection JSAccessibilityCheck
        Docker.prototype.authenticate = function (auth, callback) {
            var self = this;
            if (auth) {
                self.auth(auth, function (response) {
                    console.warn(arguments);
                    authDialog.call(self, auth, callback);
                });
            } else {
                authDialog.call(self, auth, callback);
            }
        };
        
        return new Docker;
    }]);
