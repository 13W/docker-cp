'use strict';

angular.module('dockerUiApp').controller('ImagesCtrl', [
    '$scope', 'Docker', function ($scope, Docker) {
        $scope.images = [];
        $scope.options = {all: true};

        function createTree(images, container) {
            var ids = {},
                parents = container || [],
                pids = {};
            images.forEach(function (image) {
                ids[image.Id] = image;
                pids[image.Id] = pids[image.Id] || [];
                image.children = pids[image.Id];
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

        $scope.getImages = function () {
            Docker.images($scope.options, function (images) {
                $scope.images.splice(0);
                createTree(images, $scope.images);
//                images.forEach(function (image) {
//                    $scope.images.push(image);
//                });
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
                    link : '/image/{{ Id.slice(0, 12) }}'
                },
                {
                    name : 'Name',
                    field: 'RepoTags',
                    link : '/image/{{ Id.slice(0, 12) }}',
                    map  : function (e) {
                        return e[0].split(':')[0]
                    }
                },
                {
                    name  : 'Created',
                    field : 'Created',
                    map   : function (e) {
                        return new Date(e * 1000);
                    },
                    filter: {name: 'date'}
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
                }
            ],
            nested: true
        };
        
        $scope.getImages();
    }]);
