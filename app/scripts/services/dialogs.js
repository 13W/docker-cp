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
                        Hostname: '',                                           //
                        Domainname: '',                                         //
                        User: '',                                               //
                        Memory: 0,                                              //
                        MemorySwap: 0,                                          //
                        CpuShares: null,                                        //
                        Cpuset: null,                                           //
                        AttachStdin: false,                                     //
                        AttachStdout: false,                                    //
                        AttachStderr: false,                                    //
                        Tty: true,                                              //
                        OpenStdin: true,                                        //
                        StdinOnce: false,                                       //
                        Env: [],                                                //
                        Cmd: [],                                                //
                        Entrypoint: [],                                         //
                        Image: '',                                              //
                        Volumes: {},                                            //
                        WorkingDir: '',                                         //
                        NetworkDisabled: false,                                 //
                        MacAddress: null,                                       //
                        ExposedPorts: {},                                       //
                        SecurityOpts: [],                                       //
                        HostConfig: {
                            Binds: [],                                          //
                            Links: [],                                          //
                            LxcConf: {},                                        //
                            PortBindings: {},                                   //
                            PublishAllPorts: false,                             //
                            Privileged: false,                                  //
                            Dns: ['8.8.8.8', '8.8.4.4'],                        //
                            DnsSearch: [],                                      //
                            ExtraHosts: [],                                     //
                            VolumesFrom: [],                                    //
                            CapAdd: [],                                         //
                            CapDrop: [],                                        //
                            RestartPolicy: {Name: '', MaximumRetryCount: 0},    //
                            NetworkMode: 'bridge',                              //
                            Devices: []                                         //
                        }
                    };
                    return $modal.open({
                        templateUrl: 'views/create-container.html',
                        resolve: {
                            input: function () {
                                return angular.extend({}, defaults, predefined);
                            }
                        },
                        controller: 'CreateContainerCtrl',
                        controllerAs: 'CC'
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
                },
                pushImage: function pushImage(tags) {
                    return $modal.open({
                        templateUrl: 'views/push-image.html',
                        resolve    : {
                            tags   : function () {
                                return tags;
                            }
                        },
                        controller: 'PushImageCtrl'
                    }).result;
                }
            };
        }
    ]);
