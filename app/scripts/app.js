'use strict';

angular.module('dockerUiApp', [
        'ngCookies', 'ngResource', 'ngSanitize', 'ngRoute', 'ui.bootstrap', 'ui.bootstrap.modal', 'route-segment',
        'view-segment', 'chieffancypants.loadingBar', 'ui.bootstrap.pagination', 'ui.bootstrap.progressbar',
        'ui.bootstrap.alert', 'decipher.tags', 'ui.bootstrap.typeahead', 'ui.bootstrap.datepicker'])
    .config([
        '$routeProvider', '$locationProvider', '$routeSegmentProvider', 'cfpLoadingBarProvider',
        function ($routeProvider, $locationProvider, $routeSegmentProvider, cfpLoadingBarProvider) {

            cfpLoadingBarProvider.includeSpinner = true;
            cfpLoadingBarProvider.textSpinner = 'Wait...';

            $locationProvider.hashPrefix('!');
            $routeSegmentProvider.options.autoLoadTemplates = true;
            $routeSegmentProvider
                .when('/', 'root')
                .when('^/set/:key/:value*', 'root.set')
                .when('/info', 'root.info')
                .when('/events', 'root.events')
                .when('/container/create', 'root.createContainer')
                .when('/container/:containerId', 'root.container')
                .when('/containers', 'root.containers')
                .when('/images', 'root.images')
                .when('/images/search', 'root.images-search')
                .when('/image/:imageId', 'root.image')

                .segment('root', {
                    templateUrl: 'views/main.html',
                    controller : 'MainCtrl',
                    title      : 'Docker.io: Control Panel'
                })
                .within()
                    .segment('set', {
                        resolve: {
                            data: ['$q', '$location', '$route', 'Config', 'Docker', function ($q, $location, $route, Config, Docker) {
                                var defer = $q.defer();
                                var key = $route.current.params.key;
                                Config[key] = $route.current.params.value;

                                Docker
                                    .version(function (version) {
                                        defer.resolve(version);
                                        $location.path('/info');
                                    })
                                    .error(function () {
                                        defer.reject(new Error('Error connecting to host'));
                                    });
                                return defer.promise;
                            }]
                        }
                    })
                    .segment('info', {
                        templateUrl: 'views/info.html',
                        controller: 'InfoCtrl',
                        title      : 'Docker.io: Info'
                    })
                    .segment('event', {
                        templateUrl: 'views/event.html',
                        controller : 'EventCtrl',
                        title      : 'Docker.io: Event'
                    })
                    .segment('events', {
                        templateUrl: 'views/events.html',
                        controller : 'EventsCtrl',
                        title      : 'Docker.io: Events'
                    })
                    .segment('createContainer', {
                        templateUrl: 'views/create-container.html',
                        controller : 'CreateContainerCtrl',
                        title      : 'Docker.io: Create Container'
                    })
                    .segment('container', {
                        templateUrl: 'views/container.html',
                        controller : 'ContainerCtrl',
                        title      : 'Docker.io: Container',
                        resolve    : {
                            container: ['$q', '$route', 'Docker', function ($q, $route, Docker) {
                                var containerId = $route.current.params.containerId, defer = $q.defer();
                                Docker.inspect({p1: containerId}, function (container) {
                                    defer.resolve(container);
                                });
    
                                return defer.promise;
                            }]
                        },
                        dependencies: ['containerId']
                    })
                    .segment('containers', {
                        templateUrl: 'views/containers.html',
                        controller : 'ContainersCtrl',
                        title      : 'Docker.io: Containers'
                    })
                    .segment('image', {
                        templateUrl   : 'views/image.html',
                        controller    : 'ImageCtrl',
                        reloadOnSearch: false,
                        title         : 'Docker.io: Image'
                    })
                    .segment('images', {
                        templateUrl: 'views/images.html',
                        controller : 'ImagesCtrl',
                        title      : 'Docker.io: Images'
                    })
                    .segment('images-search', {
                        templateUrl: 'views/images-search.html',
                        controller : 'ImagesSearchCtrl',
                        title      : 'Docker.io: Images Search'
                    });

            $routeProvider.otherwise({
                redirectTo: '/info'
            });
        }]);
