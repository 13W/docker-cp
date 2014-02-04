'use strict';

angular.module('dockerUiApp').controller('MainCtrl', [
    '$scope', '$rootScope', '$location', 'cfpLoadingBar', function ($scope, $rootScope, $location, cfpLoadingBar) {
        $scope.currentLocation = $location.$$path.split('/').slice(0, 2).join('/');
        $rootScope.$on('$routeChangeSuccess', function (event, next) {
            $scope.currentLocation = next.$$route.originalPath || $location.$$path.split('/').slice(0, 2).join('/');
            if (cfpLoadingBar.status()) {
                cfpLoadingBar.complete();
            }
        })
    }]);
