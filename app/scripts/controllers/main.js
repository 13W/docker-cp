'use strict';

angular.module('dockerUiApp').config([
    '$httpProvider',
    function ($httpProvider) {
        $httpProvider.interceptors.push(['$rootScope', 'Config', function ($rootScope, Config) {
            return {
                request: function (config) {
                    config.headers = config.headers || {};

                    if (config.headers['X-Registry-Auth']) {
                        if ($rootScope.auth && Config.features.registryAuth) {
                            config.headers['X-Registry-Auth'] = $rootScope.auth.data;
                        } else {
                            delete config.headers['X-Registry-Auth'];
                        }
                    }

                    return config;
                },
                requestError : function (rejection) {
                    if (!rejection.data) {
                        return rejection;
                    }
                    $rootScope.alert.value = {type: 'warning', msg: rejection.data};
                    return rejection;
                },
                responseError: function (rejection) {
                    if (!rejection.data) {
                        return rejection;
                    }
                    $rootScope.alert.value = {type: 'warning', msg: rejection.data};
                    return rejection;
                }
            };
        }]);
    }])
    .controller('MainCtrl', [
        '$scope', '$rootScope', '$routeSegment', '$location', '$cookies', '$base64', 'Docker', 'Config',
        function ($scope, $rootScope, $routeSegment, $location, $cookies, $base64, Docker, Config) {
            $rootScope.search = $scope.search = {value: ''};
            $rootScope.alert = $scope.alert = {value: null};
            $scope.currentLocation = $location.$$path.split('/').slice(0, 2).join('/');
            $scope.dockerHost = $rootScope.dockerHost || Config.host;

            $rootScope.$reload = function $reload() {
                $routeSegment.chain.slice(-1)[0].reload();
            };
            $rootScope.$watch('dockerHost', function (dockerHost) {
                if (dockerHost !== $scope.dockerHost) {
                    $scope.dockerHost = $rootScope.dockerHost || Config.host;
                }
            });

            $rootScope.$on('$routeChangeSuccess', function (event, next) {
                $scope.currentLocation = (next.$$route && next.$$route.originalPath) ||
                                         $location.$$path.split('/').slice(0, 2).join('/');
            });

            if ($cookies.auth) {
                try {
                    $scope.auth = $rootScope.auth = JSON.parse($cookies.auth);
                    $scope.auth.password = JSON.parse($base64.decode($scope.auth.data)).password;
                    Docker.auth($scope.auth, function (response) {
                        if (response.Status !== 'Login Succeeded') {
                            $scope.auth = $rootScope.auth = $cookies.auth = '';
                        }
                        delete $scope.auth.password;
                    });
                } catch (e) {
                    $scope.auth = $rootScope.auth = $cookies.auth = '';
                }
            }

            $scope.authenticate = function () {
                Docker.authenticate(null, function (error, auth) {
                    if (!error && auth) {
                        auth.data = $base64.encode(JSON.stringify(auth));
                        delete auth.password;
                        $scope.auth = $rootScope.auth = auth;
                        $cookies.auth = JSON.stringify(auth);
                    }
                });
            };
        }
    ]);
