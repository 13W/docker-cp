'use strict';

/**
 * @ngdoc function
 * @name dockerUiApp.controller:PushImageCtrl
 * @description
 * # PushImageCtrl
 * Controller of the dockerUiApp
 */
angular.module('dockerUiApp')
    .controller('PushImageCtrl', [
        '$scope', '$modalInstance', 'tags', '$filter',
        function ($scope, $modalInstance, tags, $filter) {
            console.info('Tags:', tags);
            $scope.input = {tag: ''};
            $scope.tags = tags;
            $scope.getTags = function getTags(term) {
                return $filter('filter')(tags, term);
            };
            $scope.ok = function () {
                $modalInstance.close($scope.input.tag);
            };
            $scope.close = $modalInstance.dismiss.bind($modalInstance);
        }
    ]);
