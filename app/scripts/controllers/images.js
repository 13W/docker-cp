'use strict';

angular.module('dockerUiApp').controller('ImagesCtrl', [
    '$scope', '$location', '$filter', 'Docker',
    function ($scope, $location, $filter, Docker) {
        $scope.images = [];
        $scope.showUntagged = false;
        $scope.options = {all: false, tree: false};

        $scope.reload = function () {
            Docker.images($scope.options, function (images) {
                $scope.images = $filter('filter')(images, function (image) {
                    var tags = image.RepoTags || [];
                    return $scope.showUntagged || tags[0] !== '<none>:<none>';
                });
            });
        };

        $scope.imagesOpts = {
            colDef: [
                {
                    name : 'Id',
                    field: 'Id',
                    map  : function (e) {
                        return e.slice(0, 12);
                    },
                    link : '/image/{{ Id | shortTag }}'
                },
                {
                    name : 'Name',
                    field: 'RepoTags',
                    link : '/image/{{ Id | shortTag }}',
                    map  : function (e) {
                        var unique = {};
                        return e
                            .map(function (tag) {
                                var parsed = Docker.parseTag(tag);
                                return parsed.nameWithRegistry;
                            }).filter(function (e) {
                                var isUnique = !unique[e];
                                unique[e] = true;
                                return isUnique && !!e;
                            }).join(', ');
                    }
                },
                {
                    name : 'Tags',
                    field: 'RepoTags',
                    map  : function (e) {
                        var unique = {};
                        return e
                            .map(function (e) {
                                return Docker.parseTag(e).tag;
                            })
                            .filter(function (e) {
                                var isUnique = !unique[e];
                                unique[e] = true;
                                return isUnique && !!e;
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

        $scope.searchImages = function () {
            $location.path('/images/search');
        };

        $scope.buildImage = function () {
            $location.path('/images/build');
        };

        $scope.reload();
    }]);
