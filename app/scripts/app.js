'use strict';

angular
    .module('dockerUiApp', [
        'ngCookies', 'ngResource', 'ngSanitize', 'ngRoute', 'ui.bootstrap', 'ui.bootstrap.modal', 'route-segment',
        'view-segment', 'angular-loading-bar', 'ui.bootstrap.pagination', 'ui.bootstrap.progressbar', 'base64',
        'ui.bootstrap.alert', 'ui.bootstrap.typeahead', 'ui.bootstrap.datepicker', 'ui.select',
        'ngJsonExplorer', 'ui.bootstrap.carousel', 'googlechart'])
    .config([
        '$routeProvider', '$locationProvider', '$routeSegmentProvider', 'cfpLoadingBarProvider',
        function ($routeProvider, $locationProvider, $routeSegmentProvider, cfpLoadingBarProvider) {

            cfpLoadingBarProvider.includeSpinner = true;
            cfpLoadingBarProvider.textSpinner = 'Wait...';

            $locationProvider.hashPrefix('!');
            $routeSegmentProvider.options.autoLoadTemplates = true;
            $routeSegmentProvider
                .when('/', 'root')
                .when('^/set/host/:value*', 'root.set')
                .when('/info', 'root.info')
                .when('/events', 'root.events')
                //.when('/container/create', 'root.createContainer')
                .when('/container/:containerId', 'root.container')
                .when('/containers', 'root.containers')
                .when('/images', 'root.images')
                .when('/images/search', 'root.images-search')
                .when('/image/:imageId', 'root.image')
                .when('/hosts', 'root.hosts')
                .when('/logout', 'root.logout')

                .segment('root', {
                    templateUrl: 'views/main.html',
                    controller : 'MainCtrl',
                    title      : 'Docker.io: Control Panel',
                    resolve    : {
                        data: [
                            '$q', '$cookies', '$location', 'Config', 'Docker',
                            function ($q, $cookies, $location, Config, Docker) {
                                var defer = $q.defer();
                                $cookies.dockerHost = $cookies.dockerHost || Config.host;
                                Docker.connectTo($cookies.dockerHost, function (error) {
                                    defer.resolve();
                                    if (error) {
                                        $location.path('/hosts');
                                    }
                                });
                                return defer.promise;
                            }
                        ]
                    }
                }).within()
                .segment('logout', {
                    resolve: {
                        data: ['$rootScope', '$cookies', '$location', function ($rootScope, $cookies, $location) {
                            $rootScope.auth = $cookies.auth = '';
                            $location.path('/info');
                        }]
                    }
                })
                .segment('set', {
                    resolve: {
                        data: ['$q', '$route', '$location', 'Docker', function ($q, $route, $location, Docker) {
                            var defer = $q.defer(),
                                host = $route.current.params.value;

                            Docker.connectTo(host, function (error) {
                                if (error) {
                                    $location.path('/hosts');
                                    return defer.reject(error);
                                }
                                Docker.version(function (version) {
                                    defer.resolve(version);
                                });
                            });

                            return defer.promise;
                        }]
                    }
                })
                .segment('info', {
                    templateUrl: 'views/info.html',
                    controller : 'InfoCtrl',
                    title      : 'Docker.io: Info',
                    default    : true,
                    resolve    : {
                        info   : ['$q', 'Docker', function ($q, Docker) {
                            var defer = $q.defer();

                            $q.all([Docker.info(), Docker.version()]).then(function (results) {
                                var info = results[0].data;
                                info.version = results[1].data;
                                defer.resolve(info);
                            }, defer.reject.bind(defer));

                            return defer.promise;
                        }]
                    }
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
                    dependencies: ['containerId'],
                    resolve    : {
                        container: ['$q', '$route', 'Docker', function ($q, $route, Docker) {
                            var containerId = $route.current.params.containerId, defer = $q.defer();
                            if (!containerId) {
                                return;
                            }
                            Docker.inspect({Id: containerId, errorHandler: false}, function (error, container) {
                                if (error) {
                                    defer.reject(error);
                                } else {
                                    defer.resolve(container);
                                }
                            });
                            return defer.promise;
                        }]
                    },
                    resolveFailed: {
                        templateUrl: '404.html'
                    }
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
                    title         : 'Docker.io: Image',
                    dependencies  : ['imageId'],
                    resolve       : {
                        image     : ['$q', '$route', 'Docker', function ($q, $route, Docker) {

                            /** @namespace $route.current.params.imageId */
                            var imageId = $route.current.params.imageId,
                                defer = $q.defer();

                            if (!imageId) {
                                return;
                            }

                            $q.all([
                                Docker.inspectImage({Id: imageId, errorHandler: false}),
                                Docker.images({all: true, tree: false}),
                                Docker.historyImage({Id: imageId})
                            ]).then(function (results) {
                                var image = results[0].data;

                                //noinspection JSValidateTypes
                                if (results[0].status !== 200) {
                                    return defer.reject(image);
                                }
                                image.info = results[1].data.filter(function (image) {
                                    return image.Id.substr(0, 12) === imageId;
                                })[0] || {};
                                image.info.RepoTags = (image.info.RepoTags || []).filter(function (tag) {
                                    return tag !== '<none>:<none>';
                                });
                                image.history = results[2].data || [];
                                defer.resolve(image);
                            },  defer.reject.bind(defer));

                            return defer.promise;
                        }]
                    },
                    depends: ['imageId'],
                    resolveFailed: {
                        templateUrl: '404.html'
                    }
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
                })
                .segment('hosts', {
                    templateUrl: 'views/hosts.html',
                    controller : 'HostsCtrl',
                    'title'    : 'Docker.io: Hosts',
                    resolve    : {
                        hosts  : ['Docker', function (Docker) {
                            return Docker.hosts();
                        }]
                    }
                });

            $routeProvider.otherwise({
                redirectTo: '/info'
            });
        }]);
