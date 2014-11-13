'use strict';

/**
 * @ngdoc service
 * @name dockerUiApp.urlparser
 * @description
 * # urlparser
 * Service in the dockerUiApp.
 */
angular.module('dockerUiApp')
    .service('urlParser', function urlparser() {
        // AngularJS will instantiate a singleton by calling "new" on this function
        return function (href) {
            var a = document.createElement('a');
            a.href = href;
            return a;
        };
    });
