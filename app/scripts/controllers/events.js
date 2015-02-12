'use strict';

angular.module('dockerUiApp').controller('EventsCtrl', [
    '$scope', 'Docker',
    function ($scope, Docker) {
        $scope.events = [];
        $scope.since = new Date();
        $scope.stream = null;
        $scope.getEvents = function () {
            if ($scope.stream) {
                $scope.stream.abort();
                $scope.events = [];
            }
            var date = new Date($scope.since.getTime());
            date.setUTCHours(0);
            date.setUTCMinutes(0);
            date.setUTCSeconds(0);

            $scope.stream = Docker.events('since=' + ((date.getTime() / 1000) | 0), function (events) {
                events.forEach(function (event) {
                    $scope.events.unshift(event);
                });
                $scope.$apply();
            }, angular.noop);
        };

        $scope.$on('$destroy', function () {
            if ($scope.stream) {
                $scope.stream.abort();
                $scope.stream = null;
            }
            $scope.events = [];
        });

        $scope.eventsOpts = {
            colDef: [
                {name: 'Id', field: 'id', filter: 'shortTag'},
                {name: 'Event', field: 'status'},
                {name: 'From', field: 'from'},
                {
                    name: 'Time',
                    field: 'time',
                    map: function (time) {
                        return new Date(time * 1000);
                    },
                    filter: {name: 'date', options: 'medium'}
                }
            ],
            globalFilter: true
        };

        $scope.sinceOpts = {
            max: new Date().getTime(),
            'show-button-bar': false,
            showWeeks: false,
            startingDay: 1
        };

        $scope.getEvents();
    }]);
