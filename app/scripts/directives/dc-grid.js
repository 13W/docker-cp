'use strict';
angular.module('dockerUiApp').directive('ngAppendHtml', [
    '$compile', function ($compile) {
        return function (scope, element, attr) {
            /** @namespace attr.ngAppendHtml */
            element.append($compile(angular.element(scope.$eval(attr.ngAppendHtml)))(scope));
        }
    }
]);
angular.module('dockerUiApp').directive('dcGrid', [
    '$compile', '$parse', '$rootScope', '$filter', function ($compile, $parse, $rootScope, $filter) {
        return {
            template: '<div>\
                <div class="row">\
                    <div class="col-sm-2">\
                        <pager total-items="totalItems" items-per-page="maxSize" page="currentPage" num-pages="numPages"></pager>\
                    </div>\
                    <div class="pager col-sm-1 center-block" style="padding-top: 6px;">\
                        Page: {{ currentPage }} / {{ numPages }}\
                    </div>\
                </div>\
                <table class="table table-hover">\
                    <thead>\
                        <tr>\
                            <th data-ng-repeat="def in options.colDef" data-ng-click="sort(def.field)" style="cursor: pointer;">\
                                <i data-ng-class=\'{"glyphicon-chevron-up": sortUp(def.field), "glyphicon-chevron-down": sortDown(def.field)}\' class="glyphicon"></i>{{ def.name }}\
                            </th>\
                        </tr>\
                    </thead>\
                    <tbody>\
                        <tr data-ng-repeat-start="row in rows" \
                            data-ng-class="rowClass(row)" \
                            data-ng-click="subgrid(row)" \
                            style="min-width: 50px;">\
                            <td data-ng-repeat="def in options.colDef" \
                                data-ng-append-html="get(row, def)" \
                                data-ng-compile="def.compile" \
                                style="{{def.style}}" \
                                data-ng-class="def.class"></td>\
                        </tr>\
                        <tr data-ng-repeat-end data-ng-show="nested && row.Id === active" data-name="parent-{{ row.Id }}">\
                            <td colspan="{{ options.colDef.length }}">\
                                <span style="padding-left: 40px"></span>\
                            </td>\
                        </tr>\
                    </tbody>\
                </table>\
            </div>',
            restrict: 'E',
            replace: true,
            scope   : {
                options: '=',
                items: '='
            },
            link: function postLink(scope) {
                scope.currentPage = 1;
                scope.maxSize = scope.options.maxSize || 10;
                scope.nested = !!scope.options.nested;
                scope.active = null;
                var filtered = [],
                    progress = false;
                function init(rows) {
                    if (!rows.length) {
                        return;
                    }
                    scope.totalItems = rows.length;
                    if (scope.sortBy && scope.sortType) {
                        rows = $filter('orderBy')(rows, scope.sortBy, scope.sortType);
                    }
                    scope.rows = rows.slice((scope.currentPage-1) * scope.maxSize, scope.currentPage * scope.maxSize);
                    progress = false;
                }
                scope.$watchCollection('items', function (rows) {
                    progress = true;
                    scope.currentPage = 1;
                    filtered = rows;
                    init(filtered);
                });
                scope.$watch('currentPage', function () {
                    if (progress) {
                        return;
                    }
                    init(filtered);
                });
                scope.sortBy = scope.options.sortBy;
                scope.sortType = !!scope.options.sortBy;
                scope.sort = function (field) {
                    if (scope.sortBy !== field) {
                        scope.sortBy = field;
                        scope.sortType = true;
                    } else {
                        if (scope.sortType) {
                            scope.sortType = false;
                        } else {
                            scope.sortType = null;
                            scope.sortBy = null;
                        }
                    }
                    init(filtered);
                };
                scope.sortUp = function (field) {
                    return scope.sortBy === field && scope.sortType === true;
                };
                scope.sortDown = function (field) {
                    return scope.sortBy === field && scope.sortType === false;
                };
                
                if (scope.options.globalFilter) {
                    $rootScope.$watch('search.value', function (value) {
                        if (progress) {
                            return;
                        }
                        filtered = $filter('filter')(scope.items, value);
                        init(filtered);
                    });
                }
                
                scope.rowClass = function (data) {
                    if (scope.options.rowClass) {
                        return scope.options.rowClass(data);
                    }
                    return '';
                };
                
                scope.subgrid = function (row) {
                    if (!scope.nested) {
                        return;
                    }
                    /** @namespace row.Id */
                    if (!(row.children && row.children.length) || scope.active === row.Id) {
                        scope.active = null;
                        return;
                    }

                    scope.active = row.Id;
                    var newScope = scope.$new();
                    newScope.options = scope.options;
                    newScope.items = row.children;
                    angular.element('[data-name=parent-' + row.Id + '] span')
                        .html("")
                        .append($compile('<dc-grid data-options="options" data-items="items"></dc-grid>')(newScope));
                };
                
                scope.get = function (data, def) {
                    var getter = $parse(def.field),
                        value = getter(scope, data),
                        el = null;

                    data.$watch = function (interpolateFn, setter) {
                        setter(interpolateFn(data), null);
                    };

                    if (Array.isArray(def.buttons)) {
                        el = '';
                        def.buttons.forEach(function (button, i) {
                            el += '<button class="btn ' + button.class + '" data-ng-click="def.buttons[' + i + '].click(row)">' + button.name + '</button>';
                        });
                        return el;
                    }
                    
                    if (typeof def.map === 'function') {
                        value = def.map(value, data);
                    } else if (typeof def.map === 'string') {
                        el = angular.element('<div>' + def.map + '</div>');
                        value = $compile(el)(data).html();
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
                        el = $compile(el)(data).html();
                    } else {
                        el = value;
                    }
                    
                    if (el === undefined) {
                        el = '';
                    }
                    return '<span>' + el + '</span>';
                };
            }
        };
    }]);
