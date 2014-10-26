'use strict';

angular.module('dockerUiApp').service('Docker', [
    '$rootScope', '$q', '$cookies', 'http', '$http', 'stream', 'Config', 'Dialogs',
    function ($rootScope, $q, $cookies, http, $http, stream, Config, Dialogs) {
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
                $rootScope.alert = $rootScope.alert || {};
                $rootScope.alert.value = {type: 'error', msg: error};

            }
        });

        http.createService({
            containers   : {
                cache : false,
                url   : '/containers/json',
                params: {
                    size   : '=',
                    all    : '='
                }
            },
            inspect      : {
                url   : '/containers/:Id/json'
            },
            processList  : {
                cache : false,
                url   : '/containers/:Id/top',
                params: {
                    ps_args: '='
                }
            },
            create       : {
                method: 'POST',
                url   : '/containers/create',
                params: {
                    name   : '='
                }
            },
/*
            logs         : {
                stream: true,
                url   : '/containers/:Id/logs',
                params: {
                    stderr : 1,
                    stdout : 1,
                    tail   : 100,
                    timestamps: 1
                }
            },
*/
            changes      : {
                url   : '/containers/:Id/changes'
            },
            start        : {
                method: 'POST',
                url   : '/containers/:Id/start'
            },
            stop         : {
                method: 'POST',
                url   : '/containers/:Id/stop'
            },
            restart      : {
                method: 'POST',
                url   : '/containers/:Id/restart'
            },
            kill         : {
                method: 'POST',
                url   : '/containers/:Id/kill'
            },
            destroyContainer     : {
                method: 'DELETE',
                url   : '/containers/:Id'
            },
            commitContainer      : {
                method: 'POST',
                url   : '/commit',
                params: {
                    container: '=',
                    repo     : '=',
                    tag      : '=',
                    m        : '=',
                    author   : '=',
                    run      : '='
                }
            },
            export       : {
                target: 'self',
                url   : '/containers/:Id/export'
            },
            images       : {
                cache : false,
                url   : '/images/json',
                params: {
                    all    : '='
                }
            },
            inspectImage : {
                url   : '/images/:Id/json'
            },
            historyImage : {
                url   : '/images/:Id/history'
            },
            tagImage     : {
                method: 'POST',
                url   : '/images/:Id/tag',
                params: {
                    repo   : '=',
                    force  : 0
                }
            },
            deleteImage  : {
                method: 'DELETE',
                url   : '/images/:Id'
            },
            searchImage  : {
                url   : '/images/search',
                params: {
                    term   : '='
                }
            },
            pushImage    : {
                method: 'POST',
                headers: {
                    'X-Registry-Auth': '='
                },
                url   : '/images/:Name/push',
                params: {
                    tag    : '='
                }
            },
            info         : {
                url   : '/info'
            },
            version      : {
                url   : '/version'
            },
            auth         : {
                method: 'POST',
                url   : '/auth',
                error : true
            },
            ping         : {
                url   : '/ping'
            }
        }, Docker.prototype);

        //noinspection JSAccessibilityCheck
        Docker.prototype.createContainer = function (predefined) {
            return Dialogs.createContainer(predefined);
        };

        //noinspection JSAccessibilityCheck
        Docker.prototype.destroy = function (instance) {
            return Dialogs.destroy(instance);
        };

        //noinspection JSAccessibilityCheck
        Docker.prototype.commit = function (instance) {
            return Dialogs.commit(instance);
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
            var query = [], opts, request;
            ['stderr', 'stdout', 'tail'].forEach(function (param) {
                if (options[param]) {
                    query.push(param + '=' + options[param]);
                }
            });

            query.push('timestamps=0&follow=1');
            opts = {
                url: Config.host + '/containers/' + options.ID + '/logs?' + query.join('&'),
                method: 'GET',
                parseStream: false,
                progressHandler: progressHandler
            };
            request = stream.request(opts);

            request.then(callback);
            return request;
        };

        //noinspection JSAccessibilityCheck
        Docker.prototype.authenticate = function (authData, callback) {
            var self = this;

            if (authData) {
                self.auth(authData, function () {
                    Dialogs.auth(authData).then(callback.bind(null, null), callback);
                });
            } else {
                Dialogs.auth(authData).then(callback.bind(null, null), callback);
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
                defer = $q.defer(),
                parser = document.createElement('a'),
                hostKeys,
                length,
                hosts,
                ptr;

            parser.href = host;
            host = parser.protocol + '//' + parser.host;

            $http.get(host + '/_ping', {timeout: 3000, cache: false}).then(function (response) {
                if (response.status !== 200) {
                    var error = (response.statusText || 'Failed to connect to host "' + host + '"')
                        + (response.data ? '\n' + response.data : '');

                    defer.reject(new Error(error));
                    return callback(new Error(error));
                }
                $rootScope.docker_host = Config.host = $cookies.docker_host = host;

                hosts = self.hosts();
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

                hostKeys = Object.getOwnPropertyNames(hosts);
                length = hostKeys.length;

                Object.keys(hosts).splice(0, length - Config.hostsHistoryLength).forEach(function (host) {
                    delete hosts[host];
                });

                $cookies.docker_hosts = JSON.stringify(hosts);
                defer.resolve(hosts);
                callback(null, hosts);
            });

            return defer.promise;
        };

        return new Docker();
    }]);
