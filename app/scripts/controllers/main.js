'use strict';

angular.module('dockerUiApp').controller('MainCtrl', [
    '$scope', '$location', function ($scope, $location) {
        $scope.currentLocation = $location.$$path;
    }]);
