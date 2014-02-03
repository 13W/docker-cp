'use strict';

angular.module('dockerUiApp').directive('dcGrid', [
    '$compile', '$parse', '$filter', function ($compile, $parse, $filter) {
        return {
            template: '<table class="table table-hover">\
                <thead>\
                    <tr><td data-ng-repeat="def in options.colDef">{{ def.name }}</td></tr>\
                </thead>\
                <tbody>\
                    <tr data-ng-repeat="data in options.data" data-ng-class="rowClass(data)">\
                        <td ng-repeat="def in options.colDef" data-ng-bind-html="get(data, def)"></td>\
                    </tr>\
                </tbody>\
            </table>',
            restrict: 'E',
            scope   : {
                options: '='
            },
            link: function postLink(scope, element, attrs) {
                scope.rowClass = function (data) {
                    if (scope.options.rowClass) {
                        return scope.options.rowClass(data);
                    }
                };
                
                scope.get = function (data, def) {
                    var getter = $parse(def.field),
                        value = getter(scope, data),
                        el = null;
                    
                    if (def.map) {
                        value = def.map(value);
                    }
                    
                    if (def.filter) {
                        if (typeof def.filter === 'string') {
                            value = $filter(def.filter)(value);
                        } else {
                            value = $filter(def.filter.name)(value, def.filter.options);
                        }
                    }
                    if (def.link) {
                        el = angular.element('<div><a href="#!' + def.link + '">' + value + '</a></div>');
                        data.$watch = function (interpolateFn, setter) {
                            setter(interpolateFn(data), null);
                        };
                        el = $compile(el)(data).html();
                    } else {
                        el = value;
                    }
                    
                    return '<span>' + el + '</span>';
                };
                console.log(scope.options);
            }
        };
    }]);
