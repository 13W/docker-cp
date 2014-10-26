'use strict';

/**
 * @ngdoc function
 * @name dockerUiApp.controller:CommitCtrl
 * @description
 * # CommitCtrl
 * Controller of the dockerUiApp
 */
angular.module('dockerUiApp')
    .controller('CommitCtrl', [
        '$scope', 'Docker', '$modalInstance', 'instance',
        function ($scope, Docker, $modalInstance, instance) {
            $scope.input = {
                repo: instance.Name.substr(1),
                container: instance.Id.slice(0, 12)
            };

            $scope.ok = function () {
                Docker.commitContainer($scope.input, function (result) {
                    $modalInstance.close(result);
                });
            };
            $scope.close = function () {
                $modalInstance.dismiss();
            };
        }
    ]);
