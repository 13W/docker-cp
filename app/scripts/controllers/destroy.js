'use strict';

/**
 * @ngdoc function
 * @name dockerUiApp.controller:DestroyCtrl
 * @description
 * # DestroyCtrl
 * Controller of the dockerUiApp
 */
angular.module('dockerUiApp')
    .controller('DestroyCtrl', [
        '$scope', 'Docker', '$modalInstance', 'instance',
        function ($scope, Docker, $modalInstance, instance) {
            $scope.ok = function () {
                Docker.destroyContainer({Id: instance.Id.slice(0, 12), v: $scope.removeAll}, function () {
                    $modalInstance.close(true);
                });
            };
            $scope.close = function () {
                $modalInstance.dismiss();
            };
        }
    ]);
