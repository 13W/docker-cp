/**
 * User: Vladimir Bulyga <zero@ccxx.cc>
 * Project: docker-ui
 * Date: 29.08.14 23:59
 */
angular.module('dockerUiApp').service('http', [
    '$http', function ($http) {
        var Config = {
            url: '',
            errorHandler: null
        };
        function createUrl(map, params) {
            return map.replace(/(\/:[^\/]+)/g, function (a, s) {
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
                    value = data[dataKey.substr(1)];
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

        function createMethod(config) {
            return function (params, data, callback) {
                if (!callback) {
                    callback = data;
                    data = params;
                }
                // this is check after checking
                if (!callback) {
                    callback = data;
                    data = params = {};
                }
                params = createParams(angular.extend({}, config.params), params);
                var url = createUrl(Config.url, params),
                    options = {
                        method: config.method,
                        url: url,
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
                if (config.headers) {
                    options.headers = config.headers;
                }
                if (config.transformRequest) {
                    options.transformRequest = config.transformRequest;
                }
                function cb(status) {
                    return function () {
                        var args = [].slice.call(arguments);
                        if (angular.isFunction(Config.errorHandler)) {
                            if (status === 'error') {
                                Config.errorHandler.apply(null, args);
                                return;
                            }
                        } else if (status !== 'error') {
                            args.unshift(null);
                        }

                        callback.apply(this, args);
                    };
                }

                return $http(options)
                    .success(function (response) {
                        var status = response.error ? 'error' : 'success';
                        cb(status)(response);
                    })
                    .error(cb('error'));
            };
        }

        function createService(methods, service) {
            service = service || {};
            var method;
            for (method in methods) {
                if (methods.hasOwnProperty(method)) {
                    service[method] = createMethod(methods[method]);
                }
            }
            return service;
        }

        function uploadFiles(url, path, files, cb) {
            angular.extend(Config, {
                url: url
            });

            var data = new FormData();
            var metadata = {path: path, files: {}};

            for (var fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
                var file = files[fileIndex];
                metadata.files[file.name] = file.size;
            }

            data.append('metadata', JSON.stringify(metadata));

            for (var fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
                data.append('uploadInput', files[fileIndex]);
            }

            var service = createService({
                uploadFile: {
                    method: 'POST',
                    data: data,
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    },
                    params: {}
                }
            });

            service.uploadFile({}, data, cb);
        }

        return {
            createMethod: createMethod,
            config: function (config) {
                angular.extend(Config, config);
            },
            createService: createService,
            uploadFiles: uploadFiles
        };
    }
]);