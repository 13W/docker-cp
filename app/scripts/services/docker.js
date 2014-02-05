'use strict';

angular.module('dockerUiApp').service('Docker', [
    '$resource', 'stream', '$modal', 'Config', function Docker($resource, stream, $modal, Config) {
        var Docker = $resource(Config.host + '/:service/:p1/:p2', {service: '@service'}, {
            containers : {
                method : 'GET',
                isArray: true,
                params : {
                    service: 'containers',
                    p1     : 'json'
                }
            },
            inspect    : {
                method : 'GET',
                isArray: false,
                params : {
                    service: 'containers',
                    p1     : '@p1',
                    p2     : 'json'
                }
            },
            processList: {
                method : 'GET',
                isArray: false,
                params : {
                    service: 'containers',
                    p1     : '@ID',
                    p2     : 'top'
                }
            },
            start      : {
                method : 'POST',
                isArray: false,
                params : {
                    service: 'containers',
                    p1     : '@ID',
                    p2     : 'start'
                }
            },
            stop       : {
                method : 'POST',
                isArray: false,
                params : {
                    service: 'containers',
                    p1     : '@ID',
                    p2     : 'stop'
                }
            },
            restart    : {
                method : 'POST',
                isArray: false,
                params : {
                    service: 'containers',
                    p1     : '@ID',
                    p2     : 'restart'
                }
            },
            kill       : {
                method : 'POST',
                isArray: false,
                params : {
                    service: 'containers',
                    p1     : '@ID',
                    p2     : 'kill'
                }
            },
            _destroy   : {
                method : 'DELETE',
                isArray: false,
                params : {
                    service: 'containers',
                    p1     : '@ID'
                }
            },
            commit: {
                method: 'POST',
                isArray: false,
                params: {
                    service: 'commit',
                    container: '@ID',
                    repo: '@repo',
                    tag: '@tag',
                    m: '@m',
                    author: '@author',
                    run: '@run'
                }
            },
            events     : {
                method : 'GET',
                isArray: false,
                params : {
                    service: 'events',
                    p1     : '',
                    p2     : ''
                },
                includeSpinner: false
            },
            images     : {
                method: 'GET',
                isArray: true,
                params: {
                    service: 'images',
                    p1: 'json'
                }
            },
            insertToImage: {
                method: 'POST',
                isArray: false,
                params: {
                    service: 'images',
                    p1: '@ID',
                    insert: 'insert',
                    path: '@path',
                    url: '@url'
                }
            },
            inspectImage: {
                method: 'GET',
                isArray: false,
                params: {
                    service: 'images',
                    p1: '@ID',
                    p2: 'json'
                }
            },
            historyImage: {
                method: 'GET',
                isArray: true,
                params: {
                    service: 'images',
                    p1: '@ID',
                    p2: 'history'
                }
            },
            deleteImage: {
                method: 'DELETE',
                isArray: true,
                params: {
                    service: 'images',
                    p1: '@ID'
                }
            },
            searchImage: {
                method: 'GET',
                isArray: true,
                params: {
                    service: 'images',
                    p1: 'search'
                }
            },
            info: {
                method: 'GET',
                isArray: false,
                params: {
                    service: 'info'
                }
            },
            version: {
                method: 'GET',
                isArray: false,
                params: {
                    service: 'version'
                }
            }
        });

        Docker.destroy = function (instance, callback) {
            $modal.open({
                templateUrl  : 'views/destroy-container.html',
                resolve   : {
                    instance: function () {
                        return instance;
                    }
                },
                controller: function ($scope, $modalInstance, instance) {
                    $scope.instance = instance;

                    $scope.ok = function () {
                        Docker._destroy({p1: instance.ID.slice(0, 12), v: $scope.removeAll}, function () {
                            $modalInstance.close();
                            callback(true);
                        });
                    };
                    $scope.close = function () {
                        $modalInstance.reject();
                        callback(false);
                    };
                }
            });
        };

        Docker.createImage = function (options, callback) {
            var opts = {
                url: Config.host + '/images/create?' + (options.query || ''),
                method: options.method || 'POST',
                parseStream: true,
                progressHandler: options.progressHandler
            };
            
            stream.request(opts).then(callback);
        };
        
        return Docker;
    }]);
