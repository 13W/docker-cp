'use strict';

angular.module('dockerUiApp').filter('calcMem', function () {
        return function (input, type, length) {
            var num = parseInt(input, 10);
            if (!type && !length) {
                type = 'bytes'
                length = 3;
            }
            if (!length) {
                length = type;
                type = 'bytes'
            }
            
            var line = ['bytes', 'Mb', 'Gb', 'Tb', 'Pb'],
                i = line.indexOf(type);
            for (; i < line.length; i += 1) {
                if (i) {
                    num = num/1024;
                    if (num < 1024) {
                        break;
                    }
                    type = line[i];
                }
            }

            return Math.round(num, length) + (num ? type : '');
        };
    });
