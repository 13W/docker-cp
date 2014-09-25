'use strict';

angular.module('dockerUiApp').controller('ImagesSearchCtrl', [
    '$scope', '$modal', 'Docker',
    function ($scope, $modal, Docker) {
        $scope.images = [];
        $scope.imageSearch = '';
        $scope.maxRate = 0;
        $scope.doSearch = function () {
            Docker.searchImage({term: $scope.imageSearch}, function (images) {
                images.forEach(function (image) {
                    /** @namespace image.star_count */
                    $scope.maxRate = $scope.maxRate >= image.star_count ? $scope.maxRate : image.star_count;
                });
                $scope.images = images;
            });
        };

        //noinspection JSUnusedLocalSymbols,JSLint
        function star(e, data, alt) {
            return '<i class="glyphicon glyphicon-star' + (!e ? '-empty' : '') + '"' + (alt !== undefined ? ' title="' + alt + '"' : '') + '></i>';
        }

        function rating(e) {
            var rate = Math.round(!$scope.maxRate ? 0 : e / $scope.maxRate * 5);
            //noinspection JSLint
            return [1, 2, 3, 4, 5].map(function (o, i) { return star(rate && i <= rate, undefined, e); }).join('');
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

        $scope.selectImageTag = function (image, callback) {
            Docker.getImageTags(image.name).then(function (tags) {
                $modal.open({
                    templateUrl: 'views/image-version-choice.html',
                    controller: ['$scope', '$modalInstance', function ($modalScope, $modalInstance) {
                        $modalScope.image = image;
                        $modalScope.tags = tags.data;
                        $modalScope.selected = {tag: 'latest'};
                        $modalScope.ok = function ok() {
                            $modalInstance.close();
                            callback(null, $modalScope.selected.tag);
                        };
                        $modalScope.cancel = function () {
                            $modalInstance.close();
                            callback('canceled');
                        };
                    }]
                });
            });
        };

        $scope.downloadImage = function (image, tag) {
            tag = tag || 'latest';
            $scope.progress = {};
            $modal.open({
                templateUrl: 'views/download-image.html',
                keyboard: false,
                backdrop: 'static',
                resolve: {
                    image: function () {
                        return image;
                    },
                    progress: function () {
                        return $scope.progress;
                    }
                },
                controller: ['$scope', '$modalInstance', 'image', 'progress', function ($modalScope, $modalInstance, image, progress) {
                    $modalScope.image = image;
                    $modalScope.progress = progress;
                    $modalScope.tag = tag;
                    $modalScope.background = function background() {
                        $modalInstance.close();
                    };
                }]
            });

            Docker.createImage({
                query: 'fromImage=' + image.name + '&tag=' + tag,
                progressHandler: function (data) {
                    if (Array.isArray(data)) {
                        data.forEach(function (data) {
                            /** @namespace data.progressDetail */
                            if (!data.id) {
                                image.statusMessage = data.status;
                                return;
                            }
                            var ptr = ($scope.progress[data.id] || {active: true, total: 0, k: 0});
                            $scope.progress[data.id] = ptr;

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
                        $scope.$apply();
                    }
                }
            }, function () {
//                alert('Download complete');
                console.warn('Download complete?', arguments);
//                $modalWindow.close();
            });
        };

        $scope.imagesOpts = {
            colDef      : [
                {name: 'Name', field: 'name'},
                {name: 'Trusted', field: 'is_trusted', map: star},
                {name: 'Official', field: 'is_official', map: star},
                {name: 'Rating', field: 'star_count', map: rating},
                {
                    name: 'Description',
                    field: 'description',
                    style: "max-width: 500px;white-space: nowrap; overflow: hidden; text-overflow: ellipsis;",
                    map: function () {
                        return '<span data-popover="{{ row.description }}" data-popover-trigger="mouseenter">{{ row.description }}</span>';
                    }
                },
                {name     : 'Actions', buttons: [
                    {
                        name : '<i class="glyphicon glyphicon-download"></i> Download',
                        class: 'btn btn-xs btn-primary',
                        click: function (image) {
                            $scope.selectImageTag(image, function (canceled, tag) {
                                if (!canceled) {
                                    $scope.downloadImage(image, tag.name);
                                }
                            });
                        }
                    }
                ], compile: true}
            ],
            globalFilter: true
        };
    }]);
