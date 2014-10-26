'use strict';

/**
 * @ngdoc service
 * @name dockerUiApp.Dialogs
 * @description
 * # Dialogs
 * Service in the dockerUiApp.
 */
angular.module('dockerUiApp')
    .service('Dialogs', [
        '$modal',
        function ($modal) {
            return {
                auth: function auth(authData) {
                    return $modal.open({
                        templateUrl: 'views/auth.html',
                        resolve: {
                            auth: function () {
                                return authData || {};
                            }
                        },
                        controller: 'AuthCtrl'
                    }).result;
                },
                commit: function commit(instance) {
                    return $modal.open({
                        templateUrl  : 'views/commit-container.html',
                        resolve   : {
                            instance: function () {
                                return instance;
                            }
                        },
                        controller: 'CommitCtrl'
                    }).result;
                },
                createContainer: function createContainer(predefined) {
                    var defaults = {
                        'Image': '',
                        'PortSpecs': [],
                        'ExposedPorts': [],
                        'Env': [],
                        'Dns': ['8.8.8.8', '8.8.4.4'],
                        'Tty': true,
                        'AttachStdin': true,
                        'AttachStdout': true,
                        'AttachStderr': true,
                        'OpenStdin': true,
                        'StdinOnce': true,
                        'Volumes': [],
                        'VolumesFrom': []
                    };
                    return $modal.open({
                        templateUrl: 'views/create-container.html',
                        resolve: {
                            input: function () {
                                return angular.extend({}, defaults, predefined);
                            }
                        },
                        controller: 'CreateContainerCtrl'
                    }).result;
                },
                destroy: function destroy(instance) {
                    return $modal.open({
                        templateUrl  : 'views/destroy-container.html',
                        resolve   : {
                            instance: function () {
                                return instance;
                            }
                        },
                        controller: 'DestroyCtrl'
                    }).result;
                }
            };
        }
    ]
);
