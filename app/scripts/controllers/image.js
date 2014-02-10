'use strict';

angular.module('dockerUiApp').controller('ImageCtrl', [
    '$scope', '$rootScope', '$route', '$location', 'Docker', function ($scope, $rootScope, $route, $location, Docker) {
        $scope.imageId = $route.current.params.imageId;
        $scope.destroyImage = function () {
            if ($scope.imageId) {
                Docker.deleteImage({ID: $scope.imageId.slice(0, 12)}, function (response) {
                    console.warn(response);
                    $location.path('/images');
                });
            }
        };

        $scope.history = [];
        $scope.getImage = function (imageId) {
            Docker.inspectImage({ID: imageId}, function (image) {
                $scope.image = image;
            });
            Docker.historyImage({ID: imageId}, function (history) {
                $scope.history = history;
            });
        };
        
        $scope.getImage($scope.imageId);
        // route update?!!!
        $rootScope.$on('$routeChangeSuccess', function (event, next) {
            if (next.params.imageId) {
                $scope.getImage(next.params.imageId.slice(0, 12));
            }
        });

        $scope.imageHistoryOpts = {
            colDef: [
                {name: 'Id', field: 'Id', filter: 'shortTag', link: '/image/{{ Id | shortTag }}'},
                {name: 'Created By', field: 'CreatedBy', map: function (e) {return e || ''; }},
                {name: 'Date', field: 'Created', map: function (e) {return new Date(e*1000)}, filter: 'date'},
                {name: 'Size', field: 'Size', filter: 'calcMem'}
            ],
            maxSize: 5
        };
    }]);
