'use strict';

angular.module('dockerUiApp').controller('ImageCtrl', [
    '$scope', '$routeSegment', '$location', 'Docker', 'image',
    function ($scope, $routeSegment, $location, Docker, image) {
        $scope.image = image;
        $scope.destroyImage = function () {
            Docker.deleteImage({Id: image.Id.slice(0, 12)}, function () {
                $location.path('/images');
            });
        };

        $scope.imageHistoryOpts = {
            colDef: [
                {name: 'Id', field: 'Id', filter: 'shortTag', link: '/image/{{ Id | shortTag }}'},
                {
                    name: 'Created By',
                    field: 'CreatedBy',
                    style: "max-width: 500px;white-space: nowrap; overflow: hidden; text-overflow: ellipsis;",
                    map: function () {
                        return '<span>{{ row.CreatedBy || \'\' }}</span>';
                    }
                },
                {name: 'Date', field: 'Created', map: function (e) {return new Date(e * 1000); }, filter: 'date'},
                {name: 'Size', field: 'Size', filter: 'calcMem'}
            ],
            maxSize: 5
        };

        $scope.$on('$routeChangeSuccess', function () {
            $routeSegment.chain.slice(-1)[0].reload();
        });
    }]);
