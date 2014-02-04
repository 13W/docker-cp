'use strict';

/**
 * Command: "/sbin/init "
 Created: 1391123741
 Id: "3c9f30ff1543f63f309daf01794883133eb5e9651e7a96babd21eef851c87b6d"
 Image: "debian:7.0"
 Names: Array[1]
 Ports: null
 SizeRootFs: 0
 SizeRw: 0
 Status: "Ghost"
 */

angular.module('dockerUiApp').controller('ContainersCtrl', [
    '$scope', 'Docker', function ($scope, Docker) {
        $scope.containers = [];
        $scope.containerOpts = {
            colDef: [
                {
                    name: 'Id',
                    field: 'Id',
                    map  : function (e) {
                        return e.slice(0, 12)
                    },
                    link : '/container/{{Id.slice(0,12)}}'
                },
                {
                    name : 'Name',
                    field: 'Names',
                    map  : function (e) {
                        return e.map(function (e) {
                            return e.slice(1)
                        }).join(',');
                    },
                    link : '/container/{{ Id.slice(0, 12) }}'
                },
                {name: 'Image', field: 'Image'},
                {name: 'Size', field: 'SizeRw', filter: {name: 'calcMem'}},
                {name: 'Status', field: 'Status'},
                {
                    name : 'Created',
                    field: 'Created',
                    map  : function (e) {
                        return new Date(e*1000);
                    },
                    filter: {name: 'date', options: 'mediumDate'}
                }
            ],
            rowClass: function (data) {
                return {
                    success: !/^Exit/g.test(data.Status)
                }
            }
        };
        $scope.options = {size: true, all: true};
        $scope.reload = function () {
            Docker.containers($scope.options, function (containers) {
                $scope.containers.splice(0);
                containers.forEach(function (container) {
                    $scope.containers.push(container);
                });
            });
        };
        
        $scope.reload();
    }]);
