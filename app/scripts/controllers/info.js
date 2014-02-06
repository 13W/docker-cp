'use strict';

angular.module('dockerUiApp').controller('InfoCtrl', [
    '$scope', 'Config', 'Docker', function ($scope, Config, Docker) {
        $scope.info = null;
        $scope.Config = Config;
        Docker.info(function (info) {
            $scope.info = info;
        })
    }]);
