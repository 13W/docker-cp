'use strict';

angular.module('dockerUiApp').controller('ImagesCtrl', [
    '$scope', '$location', 'Docker', function ($scope, $location, Docker) {
        $scope.images = [];
        $scope.options = {all: true, tree: true};

        function createTree(images, container) {
            var ids = {},
                parents = container || [],
                pids = {};
            images.forEach(function (image) {
                ids[image.Id] = image;
                pids[image.Id] = pids[image.Id] || [];
                image.children = pids[image.Id];
                /** @namespace image.ParentId */
                if (!image.ParentId) {
                    parents.push(image);
                } else {
                    if (pids[image.ParentId]) {
                        pids[image.ParentId].push(image);
                    } else {
                        pids[image.ParentId] = [image];
                    }

                }
                
            });
            
            return parents;
        }

        $scope.reload = function () {
            Docker.images($scope.options, function (images) {
                $scope.images.splice(0);
                if ($scope.options.tree) {
                    $scope.images = createTree(images);
                } else {
                    $scope.images = images;
                }
            });
        };

        $scope.imagesOpts = {
            colDef: [
                {
                    name : 'Id',
                    field: 'Id',
                    map  : function (e) {
                        return e.slice(0, 12)
                    },
                    link : '/image/{{ Id | shortTag }}'
                },
                {
                    name : 'Name',
                    field: 'RepoTags',
                    link : '/image/{{ Id | shortTag }}',
                    map  : function (e) {
                        return e[0].split(':')[0]
                    }
                },
                {
                    name : 'Tags',
                    field: 'RepoTags',
                    map  : function (e) {
                        return e
                            .map(function (e) {
                                return e.split(':')[1]
                            })
                            .filter(function (e) {
                                return !!e;
                            })
                            .join(', ');
                    }
                },
                {
                    name: 'Size',
                    field: 'Size',
                    filter: 'calcMem'
                },
                {
                    name: 'Virtual Size',
                    field: 'VirtualSize',
                    filter: 'calcMem'
                },
                {
                    name  : 'Created',
                    field : 'Created',
                    map   : function (e) {
                        return new Date(e * 1000);
                    },
                    filter: {name: 'date'}
                }
            ],
            nested: true,
            globalFilter: true
        };
        
        $scope.destroyImage = function () {
            if ($scope.imageId)
            Docker.deleteImage({ID: $scope.imageId}, function (){
                
            });
        };
        
        $scope.searchImages = function () {
            $location.path('/images/search');
        };
        $scope.reload();
    }]);
