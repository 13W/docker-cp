'use strict';

angular.module('dockerUiApp')
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push(['$rootScope', function ($rootScope) {
            return {
                requestError: function (rejection) {
                    $rootScope.alert.value = {type: 'warning', msg: rejection.data};
                    console.warn('requestError', arguments);
                    return rejection;
                },
                responseError: function (rejection) {
                    $rootScope.alert.value = {type: 'warning', msg: rejection.data};
                    console.warn('responseError', arguments);
                    return rejection;
                }
            }
        }]);
    }])
    .controller('MainCtrl', [
    '$scope', '$rootScope', '$http', '$location', 'cfpLoadingBar', function ($scope, $rootScope, $http, $location, cfpLoadingBar) {
        $rootScope.search = $scope.search = {value: ''};
        $rootScope.alert = $scope.alert = {value: null};
        $scope.currentLocation = $location.$$path.split('/').slice(0, 2).join('/');
        $rootScope.$on('$routeChangeSuccess', function (event, next) {
            $scope.currentLocation = next.$$route.originalPath || $location.$$path.split('/').slice(0, 2).join('/');
            if (cfpLoadingBar.status()) {
                cfpLoadingBar.complete();
            }
        });
        
        console.warn($http.prototype);
    }]);
