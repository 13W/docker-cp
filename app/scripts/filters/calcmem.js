'use strict';

angular.module('dockerUiApp').filter('calcMem', function () {
        return function (input, type, length) {
            var num = parseInt(input, 10);
            if (!num) {
                num = 0;
            }
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
            for (i = i >= 0 ? i : 0; i < line.length; i += 1) {
                if (i) {
                    if (num > 1024) {
                        num = num/1024;
                        type = line[i-1];
                    } else {
                        break;
                    }
                }
            }

            return num.toFixed(2) + (num ? type : '');
        };
    });
