'use strict';

angular.module('dockerUiApp').filter('shortTag', function () {
    return function (input) {
        return input && input.slice(0, 12);
    };
});
