'use strict';

angular.module('dockerUiApp').service('Docker', [
    '$resource', '$location', '$modal', 'Config', function Docker($resource, $location, $modal, Config) {
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
                method: 'GET',
                iArray: false,
                params: {
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
            _destroy    : {
                method: 'DELETE',
                isArray: false,
                params: {
                    service: 'containers',
                    p1: '@ID',
                    p2: ''
                }
            }
        });
        
        Docker.destroy = function (instance) {
            $modal.open({
                template: '<div>Are you sure to want to delete this container?</div>',
                resolve: {
                    instance: function () {
                        return instance;
                    }
                },
                controller: function ($scope, $modalInstance, instance) {
                    $scope.instance = instance;
                    
                    $scope.ok = function () {
                        Docker._destroy({ID: instance.Id.slice(0, 12), v: $scope.removeAll}, function () {
                            $location.path('#!/containers');
                            $modalInstance.close($scope.selected.item);
                        });
                    }
                }
            });
        };
        console.log(Docker.destroy);

        return Docker;
    }]);
