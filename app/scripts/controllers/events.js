'use strict';

angular.module('dockerUiApp').controller('EventsCtrl', [
    '$scope', 'Docker', function ($scope, Docker) {
        $scope.events = [];
        $scope.since = new Date().getTime() / 1000 >>> 0;
        $scope.stream = null;
        $scope.getEvents = function () {
            $scope.stream = Docker.events('since=' + ( $scope.since || 1), function (events) {
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
        });
        
        $scope.eventsOpts = {
            colDef: [
                {name: 'Id', field: 'id', map: function (e) {return e.slice(0, 12); }},
                {name: 'Event', field: 'status'},
                {name: 'From', field: 'from'},
                {name: 'Time', field: 'time', map: function (time) {return new Date(time*1000); }, filter: {name: 'date', options: 'fullDate'}}
            ],
            data: $scope.events
        };
        
        $scope.sinceOpts = {
            
        };
        
        $scope.getEvents();
    }]);
