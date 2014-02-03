'use strict';

angular.module('dockerUiApp', [
        'ngCookies', 'ngResource', 'ngSanitize', 'ngRoute', 'ui.bootstrap', 'ui.bootstrap.modal', 'route-segment', 'view-segment', 'chieffancypants.loadingBar', ]).config([
        '$routeProvider', '$locationProvider', '$routeSegmentProvider', 'cfpLoadingBarProvider', function ($routeProvider, $locationProvider, $routeSegmentProvider, cfpLoadingBarProvider) {

            cfpLoadingBarProvider.includeSpinner = true;
            cfpLoadingBarProvider.textSpinner = 'Wait...';

            $locationProvider.hashPrefix('!');
            $routeSegmentProvider.options.autoLoadTemplates = true;
            $routeSegmentProvider.when('/', 'root').when('/events', 'root.events').when('/container/:containerId', 'root.container').when('/containers', 'root.containers').when('/images', 'root.images').when('/image/:imageId', 'root.image')

                .segment('root', {
                    templateUrl: 'views/main.html',
                    controller : 'MainCtrl'
                }).within().segment('event', {
                    templateUrl: 'views/event.html',
                    controller : 'EventCtrl'
                }).segment('events', {
                    templateUrl: 'views/events.html',
                    controller : 'EventsCtrl'
                }).segment('container', {
                    templateUrl: 'views/container.html',
                    controller : 'ContainerCtrl'
                }).segment('containers', {
                    templateUrl: 'views/containers.html',
                    controller : 'ContainersCtrl'
                }).segment('image', {
                    templateUrl: 'views/image.html',
                    controller : 'ImageCtrl'
                }).segment('images', {
                    templateUrl: 'views/images.html',
                    controller : 'ImagesCtrl'
                });

            $routeProvider.otherwise({
                redirectTo: '/'
            });
        }]);
