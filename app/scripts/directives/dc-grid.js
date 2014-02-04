'use strict';

angular.module('dockerUiApp').directive('dcGrid', [
    '$compile', '$parse', '$filter', function ($compile, $parse, $filter) {
        return {
            template: '<table class="table table-hover">\
                <thead>\
                    <tr><td data-ng-repeat="def in options.colDef">{{ def.name }}</td></tr>\
                </thead>\
                <tbody>\
                    <tr data-ng-repeat-start="row in rows | orderBy:\'Status\':1" data-ng-class="rowClass(row)" data-ng-click="subgrid(row)">\
                        <td ng-repeat="def in options.colDef" data-ng-bind-html="get(row, def)"></td>\
                    </tr>\
                    <tr data-ng-repeat-end data-ng-show="nested && row.Id === active" name="parent-{{ row.Id }}">\
                        <td colspan="{{ options.colDef.length }}">\
                            <span style="padding-left: 40px"></span>\
                        </td>\
                    </tr>\
                </tbody>\
            </table>',
            restrict: 'E',
            replace: true,
            scope   : {
                options: '=',
                items: '='
            },
            link: function postLink(scope, element, attrs) {
                scope.rows = scope.items;
                scope.nested = !!scope.options.nested;
                scope.active = null;
                
                scope.rowClass = function (data) {
                    if (scope.options.rowClass) {
                        return scope.options.rowClass(data);
                    }
                };
                
                scope.subgrid = function (row) {
                    if (!scope.nested) {
                        return;
                    }
                    if (!row.children.length || scope.active === row.Id) {
                        scope.active = null;
                        return;
                    }
                    console.warn(angular.element('parent-' + row.Id));
                    scope.active = row.Id;
                    var newScope = scope.$new();
                    newScope.options = scope.options;
                    newScope.items = row.children;
                    angular.element('[name=parent-' + row.Id + '] span')
                        .html("")
                        .append($compile('<dc-grid data-options="options" data-items="items"></dc-grid>')(newScope));
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
            }
        };
    }]);
