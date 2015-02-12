'use strict';

angular.module('dockerUiApp')
    .value('Config', {
        host: 'http://localhost:4243',
        hostsHistoryLength: 10,
        features: {
            registryAuth: true
        }
    });
