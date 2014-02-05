'use strict';

angular.module('dockerUiApp').controller('ImagesSearchCtrl', [
    '$scope', 'Docker', function ($scope, Docker) {
        $scope.images = [];
        $scope.imageSearch = '';
        $scope.maxRate = 0;
        $scope.doSearch = function () {
            Docker.searchImage({term: $scope.imageSearch}, function (images) {
                images.forEach(function (image) {
                    $scope.maxRate = $scope.maxRate >= image.star_count ? $scope.maxRate : image.star_count; 
                });
                $scope.images = images;
            });
        };
        var z = {
            "star_count": 2, 
            "is_official": false, 
            "name": "tutum/hello-world", 
            "is_trusted": true, 
            "description": "Image to test docker deployments. Has Apache with a 'Hello World' page listening in port 80."
        };
        
        function star(e, alt) {
            return '<i class="glyphicon glyphicon-star' + (!e ? '-empty' : '') + '"' + (alt !== undefined ? ' title="' + alt + '"' : '') + '></i>';
        }
        
        function rating(e) {
            var rating = Math.round(!$scope.maxRate ? 0 : e/$scope.maxRate*5);
            return [1,2,3,4,5].map(function (o, i) { return star(rating && i <= rating, e) }).join('');
        }
        
        $scope.imagesOpts = {
            colDef: [
                {name: 'Name', field: 'name'},
                {name: 'Trusted', field: 'is_trusted', map: star},
                {name: 'Official', field: 'is_official', map: star},
                {name: 'Rating', field: 'star_count', map: rating},
                {name: 'Description', field: 'description', map: function (e) {return e.slice(0, 100) + '...'; }}
            ],
            globalFilter: true
        }
    }]);
