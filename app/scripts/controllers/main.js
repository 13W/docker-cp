'use strict';

angular.module('dockerUiApp').controller('MainCtrl', [
    '$scope', '$location', function ($scope, $location) {
        $scope.currentLocation = $location.$$path.split('/').slice(0, 2).join('/');
    }]);
