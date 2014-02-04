'use strict';

angular.module('dockerUiApp').controller('EventsCtrl', [
    '$scope', 'Docker', function ($scope, Docker) {
        $scope.events = [];
        $scope.since = new Date(0).getTime() / 1000 >>> 0;
        $scope.getEvents = function () {
            Docker.events({since: $scope.since || 1}, function (events) {
                console.warn(events);
                $scope.events.splice(0);
                events.forEach(function (event) {
                    $scope.events.push(event);
                })
            });
        };
        
        $scope.eventsOpts = {
            colDef: [
                {name: 'Id', field: 'id'},
                {name: 'Event', field: 'status'},
                {name: 'From', field: 'from'},
                {name: 'Time', field: 'time', map: function (time) {return new Date(time*1000); }, filter: {name: 'date', options: 'fullDate'}}
            ]
        };
        
        $scope.getEvents();
    }]);
