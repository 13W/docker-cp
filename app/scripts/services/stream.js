'use strict';

var lowercase = function (string) { return angular.isString(string) ? string.toLowerCase() : string; };

function int(str) {
    return parseInt(str, 10);
}

var msie = int((/msie (\d+)/.exec(lowercase(navigator.userAgent)) || [])[1]);
if (isNaN(msie)) {
    msie = int((/trident\/.*; rv:(\d+)/.exec(lowercase(navigator.userAgent)) || [])[1]);
}

var XHR = window.XMLHttpRequest || function () {
    /* global ActiveXObject */
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch (ignore) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch (ignore) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch (ignore) {}
    throw new Error('This browser does not support XMLHttpRequest.');
};

angular.module('dockerUiApp').factory('stream', [
    '$q', '$timeout', '$rootScope', 'Config',
    function ($q, $timeout, $rootScope, Config) {
        var ABORTED = -1;

        return {
            request: function (options) {
                var xhr = new XHR(),
                    headers = options.headers || {},
                    defer = $q.defer(),
                    nextLine = 0,
                    progress = {
                        completed: 0,
                        current: 0
                    },
                    status;

                function jsonStreamParser() {
                    var response = [], index, part, json;
                    function parse(part) {
                        try {
                            return angular.fromJson(part);
                        } catch (e) {
                            return undefined;
                        }
                    }

                    function regexIndexOf(str, regex, startpos) {
                        var indexOf = str.substring(startpos || 0).search(regex);
                        return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
                    }

                    while ((index = regexIndexOf(xhr.response, /}\s*\{/, nextLine)) !== -1) {
                        part = xhr.response.slice(nextLine, index + 1);

                        json = parse(part);
                        if (json === undefined) {
                            break;
                        }

                        response.push(json);
                        nextLine = index + 1;
                    }

                    //last try
                    part = xhr.response.slice(nextLine);

                    json = parse(part);
                    if (json !== undefined) {
                        response.push(json);
                        nextLine = xhr.response.length;
                    }

                    return response;
                }

                function doProgress() {
                    //readyState: headers received 2, body received 3, done 4
                    if (progress.completed === progress.current) {
                        return;
                    }

                    progress.completed = progress.current;
                    if (!xhr.response) {
                        return;
                    }

                    if (options.parseStream) {
                        options.progressHandler(jsonStreamParser());
                    } else {
                        options.progressHandler(xhr.response.slice(nextLine));
                        nextLine = xhr.response.length;
                    }
                }

                if (angular.isFunction(options.progressHandler)) {
                    xhr.onprogress = function () {
                        progress.current++;
                        doProgress();
                    };
                }

                xhr.onreadystatechange = function () {
                    status = xhr.status;
                    var responseHeaders = null,
                        response = null;

                    switch (xhr.readyState) {
                    case 1:
                    case 2:
                    case 3:
                        if (angular.isFunction(options.progressHandler) && progress.completed === progress.current) {
                            progress.current++;
                            doProgress();
                        }
                        break;
                    case 4:
                        if (status !== ABORTED) {
                            responseHeaders = xhr.getAllResponseHeaders();
                            response = xhr.responseType ? xhr.response : xhr.responseText;
                        }

                        // responseText is the old-school way of retrieving response (supported by IE8 & 9)
                        // response/responseType properties were introduced in XHR Level2 spec (supported by IE10)
                        defer.resolve(status || xhr.status, response, responseHeaders);
                        break;
                    }
                };

                if (options.withCredentials) {
                    xhr.withCredentials = true;
                }

                if (options.responseType) {
                    xhr.responseType = options.responseType;
                }

                function timeoutRequest() {
                    status = ABORTED;
                    if (xhr) {
                        xhr.abort();
                    }
                }

                if (options.timeout > 0) {
                    $timeout(timeoutRequest, options.timeout);
                }

                xhr.open(options.method, options.url, true);
                if (headers['X-Registry-Auth']) {
                    if ($rootScope.auth && Config.features.registryAuth) {
                        headers['X-Registry-Auth'] = $rootScope.auth.data;
                    } else {
                        delete headers['X-Registry-Auth'];
                    }
                }

                angular.forEach(headers, function (value, key) {
                    if (angular.isDefined(value)) {
                        xhr.setRequestHeader(key, value);
                    }
                });

                xhr.send(options.body);
                defer.promise.abort = function () {
                    if (xhr) {
                        xhr.abort();
                    }
                };
                defer.promise.ended = function () {
                    return xhr.readyState === 4;
                };
                defer.promise.write = function (data) {
                    if (xhr.status < 4) {
                        xhr.send(data);
                    }
                };
                return defer.promise;
            }
        };
    }]);
