'use strict';

angular.module('dockerUiApp', [
        'ngCookies', 'ngResource', 'ngSanitize', 'ngRoute', 'ui.bootstrap', 'ui.bootstrap.modal', 'route-segment',
        'view-segment', 'chieffancypants.loadingBar', ])
    .config([
        '$routeProvider', '$locationProvider', '$routeSegmentProvider', 'cfpLoadingBarProvider',
        function ($routeProvider, $locationProvider, $routeSegmentProvider, cfpLoadingBarProvider) {

            cfpLoadingBarProvider.includeSpinner = true;
            cfpLoadingBarProvider.textSpinner = 'Wait...';

            $locationProvider.hashPrefix('!');
            $routeSegmentProvider.options.autoLoadTemplates = true;
            $routeSegmentProvider.when('/', 'root').when('/events', 'root.events').when('/container/:containerId',
                    'root.container').when('/containers', 'root.containers').when('/images',
                    'root.images').when('/image/:imageId', 'root.image')

                .segment('root', {
                    templateUrl: 'views/main.html',
                    controller : 'MainCtrl',
                    title: 'Docker.io: Control Panel'
                }).within().segment('event', {
                    templateUrl: 'views/event.html',
                    controller : 'EventCtrl',
                    title: 'Docker.io: Event'
                }).segment('events', {
                    templateUrl: 'views/events.html',
                    controller : 'EventsCtrl',
                    title: 'Docker.io: Events'
                }).segment('container', {
                    templateUrl: 'views/container.html',
                    controller : 'ContainerCtrl',
                    title: 'Docker.io: Container',
                    resolve    : {
                        container: ['$q', '$route', 'Docker', function ($q, $route, Docker) {
                            var containerId = $route.current.params.containerId, defer = $q.defer();
                            Docker.inspect({p1: containerId}, function (container) {
                                defer.resolve(container);
                            });

                            return defer.promise;
                        }]
                    }
                }).segment('containers', {
                    templateUrl: 'views/containers.html',
                    controller : 'ContainersCtrl',
                    title: 'Docker.io: Containers'
                }).segment('image', {
                    templateUrl: 'views/image.html',
                    controller : 'ImageCtrl',
                    reloadOnSearch: false,
                    title: 'Docker.io: Image'
                }).segment('images', {
                    templateUrl: 'views/images.html',
                    controller : 'ImagesCtrl',
                    title: 'Docker.io: Images'
                });

            $routeProvider.otherwise({
                redirectTo: '/'
            });
        }]);
