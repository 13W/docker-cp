'use strict';

angular.module('dockerUiApp').controller('ImageCtrl', ['$scope', '$routeSegment', '$location', '$modal', 'Docker', 'image',
    function ($scope, $routeSegment, $location, $modal, Docker, image) {
        $scope.image = image;
        $scope.destroyImage = function () {
            Docker.deleteImage({ID: image.Id.slice(0, 12)}, function (response) {
                console.warn(response);
                $location.path('/images');
            });
        };

        function push(name, tag) {
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

            Docker.pushImage({
                name: name,
                query: tag && 'tag=' + tag,
                progressHandler: function (data) {
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
                            if (data.status === 'Upload complete') {
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
                console.warn('Upload complete', arguments);
            });
        };

        $scope.push = function () {
            var name = image.info.RepoTags[0];
            if (!name) {
                alert('Please, tag image first');
                return;
            }
            var parsed = name.split(':'),
                tag = parsed[1];
            name = parsed[0];
            push(name, tag);
        };

        $scope.imageHistoryOpts = {
            colDef: [
                {name: 'Id', field: 'Id', filter: 'shortTag', link: '/image/{{ Id | shortTag }}'},
                {name: 'Created By', field: 'CreatedBy', map: function (e) {return e || ''; }},
                {name: 'Date', field: 'Created', map: function (e) {return new Date(e*1000)}, filter: 'date'},
                {name: 'Size', field: 'Size', filter: 'calcMem'}
            ],
            maxSize: 5
        };

        $scope.$on('$routeChangeSuccess', function () {
            $routeSegment.chain.slice(-1)[0].reload();
        });
    }]);
