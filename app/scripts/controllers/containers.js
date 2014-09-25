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
    '$scope', '$location', 'Docker',
    function ($scope, $location, Docker) {
        $scope.containers = [];
        $scope.containerOpts = {
            colDef: [
                {
                    name: 'Id',
                    field: 'Id',
                    map  : function (e) {
                        return e.slice(0, 12);
                    },
                    link : '/container/{{Id | shortTag}}'
                },
                {
                    name : 'Name',
                    field: 'Names',
                    map  : function (e) {
                        return e.map(function (e) {
                            return e.slice(1);
                        }).join(',');
                    },
                    link : '/container/{{ Id | shortTag }}'
                },
                {name: 'Image', field: 'Image'},
                {name: 'Size', field: 'SizeRw', filter: {name: 'calcMem'}},
                {name: 'Status', field: 'Status'},
                {
                    name : 'Created',
                    field: 'Created',
                    map  : function (e) {
                        return new Date(e * 1000);
                    },
                    filter: {name: 'date', options: 'mediumDate'}
                }
            ],
            rowClass: function (data) {
                return {
                    success: data.Status && !/^Exit/g.test(data.Status)
                };
            },
            sortBy: 'Status',
            globalFilter: true
        };
        $scope.options = {size: true, all: true};
        $scope.reload = function () {
            Docker.containers($scope.options, function (containers) {
                $scope.containers = containers;
            });
        };

        $scope.createContainer = function () {
            Docker.createContainer({}, function (response) {
                if (response) {
                    $location.path('/container/' + response.Id.slice(0, 12));
                }
            });
        };

        $scope.reload();
    }]);
