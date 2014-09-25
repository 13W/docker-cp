'use strict';

angular.module('dockerUiApp').service('Docker', [
    '$rootScope', '$q', '$filter', '$cookies', '$location', 'http', '$http', 'stream', '$modal', 'Config',
    function ($rootScope, $q, $filter, $cookies, $location, http, $http, stream, $modal, Config) {
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
            url: function getUrl() {
                return Config.host + '/:service/:p1/:p2';
            },
            errorHandler: function (error) {
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
                cache : false,
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
/*
            logs         : {
                method: 'GET',
                stream: true,
                params: {
                    service: 'containers',
                    p1     : '@ID',
                    p2     : 'logs',
                    stderr : 1,
                    stdout : 1,
                    tail   : 100,
                    timestamps: 1
                }
            },
*/
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
            pushImage    : {
                method: 'POST',
                headers: {
                    'X-Registry-Auth': '='
                },
                params: {
                    service: 'images',
                    p1     : '@Name',
                    p2     : 'push',
                    tag    : '='
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
            },
            ping         : {
                method: 'GET',
                params: {
                    service: 'ping'
                }
            }
        }, Docker.prototype);

        //noinspection JSAccessibilityCheck
        Docker.prototype.createContainer = function (predefined, callback) {
            var self = this,
                defaults = {
                    'Image': '',
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
                            promise = def.promise;

                        if (!$scope.images.length) {
                            promise = self.images(function (images) {
                                $scope.images = images.map(function (image) {
                                    /** @namespace image.RepoTags */
                                    return image.RepoTags.slice(-1)[0];
                                });
                                return filter($scope.images, term);
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
                            promise = self.containers({all: true}, function (containers) {
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
                        var Volumes = {}, Binds = [], Container = angular.extend({}, $scope.input);
                        Container.Cmd = Container.Cmd || '';
                        Container.Cmd = Container.Cmd.match(/(?:[^\s"]+|"[^"]*")+/g).map(function (string) {
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

                        self.create(Container, function (response) {
                            $modalInstance.close();
                            self.start({
                                ID: response.Id,
                                Links: Container.Links,
                                LxcConf: Container.LxcConf,
                                Dns: Container.Dns,
                                VolumesFrom: Container.VolumesFrom,
                                Binds: Binds}, function () {
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
            $modal.open({
                templateUrl  : 'views/destroy-container.html',
                resolve   : {
                    instance: function () {
                        return instance;
                    }
                },
                controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
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
            $modal.open({
                templateUrl  : 'views/commit-container.html',
                resolve   : {
                    instance: function () {
                        return instance;
                    }
                },
                controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
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
                    headers: {
                        'X-Registry-Auth': '='
                    },
                    parseStream: true,
                    progressHandler: options.progressHandler
                },
                request = stream.request(opts);

            request.then(callback);
            return request;
        };

        //noinspection JSAccessibilityCheck
        Docker.prototype.pushImage = function (options, callback) {
            var opts = {
                    url: Config.host + '/images/' + options.name + '/push?' + (options.query || ''),
                    method: options.method || 'POST',
                    headers: {
    //                    'X-Registry-Auth': '='
                    },
                    parseStream: true,
                    progressHandler: options.progressHandler
                },
                request = stream.request(opts);

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
                },
                request = stream.request(opts);

            request.then(callback);
            return request;
        };

        Docker.prototype.logs = function (options, progressHandler, callback) {
            var query = [];
            ['stderr', 'stdout', 'tail'].forEach(function (param) {
                if (options[param]) {
                    query.push(param + '=' + options[param]);
                }
            });
            query.push('timestamps=0&follow=1');
            var opts = {
                    url: Config.host + '/containers/' + options.ID + '/logs?' + query.join('&'),
                    method: 'GET',
                    parseStream: false,
                    progressHandler: progressHandler
                },
                request = stream.request(opts);

            request.then(callback);
            return request;
        };

        function authDialog(auth, callback) {
            var self = this;
            $modal.open({
                templateUrl: 'views/auth.html',
                resolve: {
                    auth: function () {
                        return auth || {};
                    }
                },
                controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
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
                self.auth(auth, function () {
                    authDialog.call(self, auth, callback);
                });
            } else {
                authDialog.call(self, auth, callback);
            }
        };

        Docker.prototype.getImageTags = function (name) {
            return $http.get('https://jsonp.nodejitsu.com/?url=' +
                encodeURIComponent('https://index.docker.io/v1/repositories/' + name + '/tags'));
        };

        Docker.prototype.hosts = function () {
            var hosts = {};

            try {
                hosts = JSON.parse($cookies.docker_hosts);
            } catch (ignore) {}

            return hosts;
        };

        Docker.prototype.connectTo = function (host, callback) {
            callback = callback || angular.noop;
            var self = this,
                parser = document.createElement('a');
            parser.href = host;
            host = parser.protocol + '//' + parser.host;
            $http.get(host + '/_ping').then(function (response) {
                if (response.data !== 'OK') {
                    // Error;
                    return callback(new Error('Failed to connect to host "' + host + '"'));
                }
                $rootScope.docker_host = Config.host = $cookies.docker_host = host;

                var hosts = self.hosts(),
                    ptr = hosts[host];

                if (ptr) {
                    delete hosts[host];
                    ptr.lastConnected = new Date().getTime();
                    hosts[host] = ptr;
                } else {
                    hosts[host] = {
                        created: new Date().getTime(),
                        lastConnected: new Date().getTime()
                    };
                }

                var hostKeys = Object.getOwnPropertyNames(hosts),
                    length = hostKeys.length;

                Object.keys(hosts).splice(0, length - Config.hostsHistoryLength).forEach(function (host) {
                    delete hosts[host];
                });

                $cookies.docker_hosts = JSON.stringify(hosts);
                $location.url('/info');
                callback(null, hosts);
            });
        };

        return new Docker();
    }]);
