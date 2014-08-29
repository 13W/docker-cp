'use strict';

angular.module('dockerUiApp').service('Docker', [
    '$q', '$filter', '$http', '$sce', 'stream', '$modal', 'Config', function Docker($q, $filter, $http, $sce, stream, $modal, Config) {
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
        
        function createUrl(map, params) {
            return map.replace(/(\/:[^/]+)/g, function (a, s) {
                var key = s.substr(2);
                if (params.hasOwnProperty(key)) {
                    var value = params[key];
                    delete params[key];
                    return '/' + value;
                }
                return '';
            });
        }
        
        function createParams(map, data) {
            var params = {},
                keys = Object.getOwnPropertyNames(map),
                length = keys.length,
                k;
            
            for (k = 0; k < length; k += 1) {
                var key = keys[k],
                    dataKey = map[key],
                    value = dataKey;
                
                if (dataKey[0] === '@') {
                    value = data[dataKey.substr(1)]
                } else if (dataKey[0] === '=') {
                    dataKey = key;
                    value = data[dataKey];
                }
                
                if (value !== undefined) {
                    params[key] = value;
                }
            }
            return params;
        }
        
        function createMethod(name, config) {
            //noinspection JSAccessibilityCheck
            Docker.prototype[name] = function (data, callback) {
                if (!callback) {
                    callback = data;
                    data = {};
                }
                
                var params = createParams(angular.extend({}, config.params), data),
                    url = createUrl(config.url || '/:service/:p1/:p2', params),
                    options = {
                        method: config.method,
                        url: Config.host + url,
                        params: params
                    };
                if (config.target) {
                    if (config.target === 'self') {
                        location.href = options.url;
                        return undefined;
                    }
                }
                if (config.method === 'POST') {
                    options.data = data;
                }
                if (config.withCredentials) {
                    options.withCredentials = true;
                }
                if (config.responseType) {
                    options.responseType = config.responseType;
                }
                if (config.timeout) {
                    options.timeout = config.timeout;
                }
                var res = $http(options)
                    .success(callback);
                
                if (config.error) {
                    res.error(callback);
                }
                return res;
            }
        }

        var Methods = {
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
        };

        var methods = Object.getOwnPropertyNames(Methods),
            length = methods.length,
            k;
        for (k = 0; k < length; k += 1) {
            var method = methods[k],
                config = Methods[method];
            createMethod(method, config);
        }
        
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
                controller: ['$scope', '$modalInstance', 'input', function ($scope, $modalInstance, input) {
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
                        self.create($scope.input, function (response) {
                            $modalInstance.close();
                            callback(response);
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
