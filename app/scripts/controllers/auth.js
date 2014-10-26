'use strict';

/**
 * @ngdoc function
 * @name dockerUiApp.controller:AuthCtrl
 * @description
 * # AuthCtrl
 * Controller of the dockerUiApp
 */
angular.module('dockerUiApp')
    .controller('AuthCtrl', [
        '$scope', 'Docker', '$modalInstance', 'auth',
        function ($scope, Docker, $modalInstance, auth) {
            $scope.auth = auth;
            $scope.login = function () {
                Docker.auth($scope.auth, function (response) {
                    if (response.Status === 'Login Succeeded') {
                        $modalInstance.close($scope.auth);
                    } else {
                        $modalInstance.dismiss(new Error(response));
                    }
                });
            };

            $scope.close = function () {
                $modalInstance.dismiss();
            };
        }
    ]);
