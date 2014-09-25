'use strict';

angular.module('dockerUiApp').filter('calcMem',
    function () {
        return function (input, type) {
            var num = parseInt(input, 10) || 0,
                types = ['bytes', 'Mb', 'Gb', 'Tb', 'Pb'],
                i;
            type = type || 'bytes';
            if (!num) {
                num = 0;
            }
            if (!type) {
                type = 'bytes';
            }

            i = types.indexOf(type);
            for (i = i >= 0 ? i : 0; i < types.length; i += 1) {
                if (i) {
                    if (num > 1024) {
                        num = num / 1024;
                        type = types[i - 1];
                    } else {
                        break;
                    }
                }
            }

            return num.toFixed(2) + (num ? type : '');
        };
    });
