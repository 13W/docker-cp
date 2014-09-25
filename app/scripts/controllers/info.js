'use strict';

angular.module('dockerUiApp').controller('InfoCtrl', [
    '$scope', 'Config', 'info',
    function ($scope, Config, info) {
        $scope.info = info;
        $scope.version = info.version;
        $scope.Config = Config;
    }]);
