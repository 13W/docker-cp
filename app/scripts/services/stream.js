'use strict';

var lowercase = function(string){return angular.isString(string) ? string.toLowerCase() : string;};
function int(str) {
    return parseInt(str, 10);
}

var urlParsingNode = document.createElement("a");
var msie = int((/msie (\d+)/.exec(lowercase(navigator.userAgent)) || [])[1]);
if (isNaN(msie)) {
    msie = int((/trident\/.*; rv:(\d+)/.exec(lowercase(navigator.userAgent)) || [])[1]);
}

var XHR = window.XMLHttpRequest || function() {
    /* global ActiveXObject */
    try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch (e1) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch (e2) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e3) {}
//    throw minErr('$httpBackend')('noxhr', "This browser does not support XMLHttpRequest.");
};


angular.module('dockerUiApp').factory('stream', [
    '$q', '$timeout', function ($q, $timeout) {
        var ABORTED = -1;

        function Request(options) {

            var defer = $q.defer(), xhr = this.xhr = new XHR, headers = options.headers, nextLine = 0, status;

            xhr.open(options.method, options.url, true);

            angular.forEach(headers, function (value, key) {
                if (angular.isDefined(value)) {
                    xhr.setRequestHeader(key, value);
                }
            });

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    var responseHeaders = null, response = null;

                    if (status !== ABORTED) {
                        responseHeaders = xhr.getAllResponseHeaders();
                        response = xhr.responseType ? xhr.response : xhr.responseText;
                    }

                    // responseText is the old-school way of retrieving response (supported by IE8 & 9)
                    // response/responseType properties were introduced in XHR Level2 spec (supported by IE10)
                    defer.resolve(status || xhr.status, response, responseHeaders);
                }
            };

            function jsonStreamParser() {
                var response = [], index, part, json;
                function parse(part) {
                    try {
                        return angular.fromJson(part);
                    } catch (e) {
                        return undefined;
                    }
                }

                while (!!~(index = xhr.response.indexOf('}{', nextLine))) {
                    part = xhr.response.slice(nextLine, index + 1);

                    json = parse(part);
                    if (json === undefined) {
                        break;
                    } else {
                        response.push(json);
                        nextLine = index + 1;
                    }
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

            if (angular.isFunction(options.progressHandler)) {

                xhr.onprogress = function () {
                    //readyState: headers received 2, body received 3, done 4
                    if (xhr.readyState != 2 && xhr.readyState != 3 && xhr.readyState != 4)
                        return;
                    if (xhr.readyState == 3 && xhr.status != 200)
                        return;

                    if (options.parseStream) {
                        options.progressHandler(jsonStreamParser());
                    } else {
                        options.progressHandler(xhr.response.slice(nextLine));
                        nextLine = xhr.response.length;
                    }
                };
            }

            if (options.withCredentials) {
                xhr.withCredentials = true;
            }

            if (options.responseType) {
                xhr.responseType = options.responseType;
            }

            xhr.send(options.post || null);
            if (options.timeout > 0) {
                $timeout(timeoutRequest, options.timeout);
            }


            function timeoutRequest() {
                status = ABORTED;
                xhr && xhr.abort();
            }

            return defer.promise;
        }

        return {
            request: function (options) {
                return new Request(options);
            }
        };
    }]);
