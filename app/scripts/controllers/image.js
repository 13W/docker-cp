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
                    style: 'max-width: 500px;white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
                    map: function () {
                        return '<span>{{ row.CreatedBy || \'\' }}</span>';
                    }
                },
                {name: 'Date', field: 'Created', map: function (e) {return new Date(e * 1000); }, filter: 'date'},
                {name: 'Size', field: 'Size', filter: 'calcMem'}
            ],
            maxSize: 5
        };

        $scope.onTagAdded = function onTagAdded(tag) {
            if (!Docker.parseTag(tag).name) {
                return false;
            }
            var repoTags = $scope.image.info.RepoTags;
            Docker.tagImage({Id: image.Id, repo: tag.text}).then(function () {
                var index = repoTags.indexOf(tag);
                repoTags.splice(index, 1);
            });
        };
        $scope.onTagRemoved = function onTagRemoved(tag) {
            if (!Docker.parseTag(tag).name) {
                return false;
            }
            Docker.deleteImage({Id: tag || image.Id}, function (messages) {
                var lastMessage = messages.slice(-1)[0] || {};
                if (lastMessage.Deleted === image.Id) {
                    $location.path('/images');
                }
            });
        };

        $scope.pushImage = function () {
            var tags = (image.info.RepoTags || []).map(function (tag) {
                return tag.text || tag;
            });
            Docker.pushImage({
                tags: tags,
                progressHandler: function () {
                    console.log(arguments);
                }
            }, function () {
                console.log('Image pushed', arguments);
            });
        };

        $scope.$on('$routeChangeSuccess', $scope.$reload);
    }]);
