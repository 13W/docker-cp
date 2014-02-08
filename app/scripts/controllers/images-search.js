'use strict';

angular.module('dockerUiApp').controller('ImagesSearchCtrl', [
    '$scope', '$modal', 'Docker', function ($scope, $modal, Docker) {
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

        function star(e, alt) {
            return '<i class="glyphicon glyphicon-star' + (!e ? '-empty' : '') + '"' + (alt !== undefined ? ' title="' + alt + '"' : '') + '></i>';
        }
        
        function rating(e) {
            var rating = Math.round(!$scope.maxRate ? 0 : e/$scope.maxRate*5);
            return [1,2,3,4,5].map(function (o, i) { return star(rating && i <= rating, e) }).join('');
        }
        function isEmpty(e) {
            var i;
            for (i in e) {
                if (e.hasOwnProperty(i)) {
                    return false;
                }
            }
            return true;
        }
        
        $scope.downloadImage = function (image) {
            $scope.progress = {};
            $modal.open({
                templateUrl: 'views/download-image.html',
                resolve: {
                    image: function () {
                        return image;
                    },
                    progress: function () {
                        return $scope.progress;
                    }
                },
                controller: ['$scope', '$modalInstance', 'image', 'progress', function ($scope, $modalInstance, image, progress) {
                    $scope.image = image;
                    $scope.progress = progress;

                    $scope.background = $scope.close = function ok() {
                        $modalInstance.close();
                    };
                }]
            });
            
            Docker.createImage({
                query: 'fromImage=' + image.name,
                progressHandler: function (data) {
/*
                [{
                    id: "fbef37ddf7ce"
                    progress: "[==================================================>] 145.2 MB/145.2 MB"
                    progressDetail: Object
                    current: 145206197
                    start: 1391639102
                    total: 145206197
                    __proto__: Object
                    status: "Downloading"
                }]
*/
                    if (Array.isArray(data)) {
                        data.forEach(function (data) {
                            if (!data.id) {
                                image.statusMessage = data.status;
                                return;
                            }
                            var ptr = $scope.progress[data.id] = $scope.progress[data.id] || {active: true, total: 0, k: 0};
                            
                            if (!isEmpty(data.progressDetail)) {
                                ptr.start = ptr.start || new Date(data.progressDetail.start * 1000);
                                ptr.total = data.progressDetail.total;
                                ptr.current = data.progressDetail.current;
                                ptr.k = ptr.current * 100 / ptr.total;
                            }
                            if (data.status === 'Download complete') {
                                ptr.k = 100;
                                ptr.current = ptr.total;
                                ptr.active = false;
                            }
                            ptr.status = data.status;
                        });
                    }
                }
            }, function () {
                console.warn('Download complete', arguments);
            });
        };
        
        $scope.imagesOpts = {
            colDef      : [
                {name: 'Name', field: 'name'},
                {name: 'Trusted', field: 'is_trusted', map: star},
                {name: 'Official', field: 'is_official', map: star},
                {name: 'Rating', field: 'star_count', map: rating},
                {name: 'Description', field: 'description', map: function (e) {
                    return e.slice(0, 100) + '...';
                }},
                {name     : 'Actions', buttons: [
                    {
                        name : '<i class="glyphicon glyphicon-download"></i> Download',
                        class: 'btn btn-xs btn-primary',
                        click: function (data) {
                            $scope.downloadImage(data);
                        }
                    }
                ], compile: true}
            ],
            globalFilter: true
        };
    }]);
