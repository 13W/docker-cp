'use strict';
angular.module('dockerUiApp').directive('ngAppendHtml', [
    '$compile', function ($compile) {
        return function (scope, element, attr) {
            /** @namespace attr.ngAppendHtml */
            element.append($compile(angular.element(scope.$eval(attr.ngAppendHtml)))(scope));
        };
    }
]);
angular.module('dockerUiApp').directive('dcGrid', [
    '$compile', '$parse', '$rootScope', '$filter', '$injector', '$q',
    function ($compile, $parse, $rootScope, $filter, $injector, $q) {

        return {
            templateUrl: 'views/dc-grid.html',
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
                scope.rows = [];

                var filtered = [],
                    progress = false;

                function resetSelection() {
                    scope.selection = {
                        selectAll: false,
                        selected: {}
                    };
                }
                function init(rows) {
                    resetSelection();

                    if (!rows.length) {
                        scope.rows = [];
                        return;
                    }
                    scope.totalItems = rows.length;
                    if (scope.sortBy && angular.isDefined(scope.sortOrder)) {
                        rows = $filter('orderBy')(rows, scope.sortBy, scope.sortOrder);
                    }
                    scope.rows = rows.slice((scope.currentPage - 1) * scope.maxSize, scope.currentPage * scope.maxSize);
                    progress = false;
                }
                scope.$watchCollection('items', function (rows) {
                    progress = true;
                    scope.currentPage = 1;
                    filtered = rows || [];
                    init(filtered);
                });
                scope.$watch('currentPage', function () {
                    if (progress) {
                        return;
                    }
                    init(filtered);
                });
                scope.sortBy = scope.options.sortBy;
                scope.sortOrder = !!scope.options.sortBy;
                scope.sort = function (field) {
                    if (scope.sortBy !== field) {
                        scope.sortBy = field;
                        scope.sortOrder = true;
                    } else {
                        if (scope.sortOrder) {
                            scope.sortOrder = false;
                        } else {
                            scope.sortOrder = null;
                            scope.sortBy = null;
                        }
                    }
                    init(filtered);
                };

                scope.sortUp = function (field) {
                    return scope.sortBy === field && scope.sortOrder === true;
                };

                scope.sortDown = function (field) {
                    return scope.sortBy === field && scope.sortOrder === false;
                };
                function updateSelectAllState() {
                    scope.selection.selectAll = Object.keys(scope.selection.selected).length === scope.rows.length;
                }
                scope.invertSelection = function invertSelection(index) {
                    if (!scope.selection.selected[index]) {
                        scope.selection.selected[index] = true;
                    } else {
                        delete scope.selection.selected[index];
                    }
                    updateSelectAllState();
                };
                scope.invertSelectAll = function invertSelectionAll() {
                    scope.rows.forEach(function (row, index) {
                        if (scope.selection.selectAll && scope.selection.selected[index]) {
                            delete scope.selection.selected[index];
                        } else if (!scope.selection.selectAll) {
                            scope.selection.selected[index] = true;
                        }
                    });
                    scope.selection.selectAll = !scope.selection.selectAll;
                };
                scope.selectionLength = function selectionLength() {
                    return Object.keys(scope.selection.selected).length;
                };
                scope.getSelection = function getSelection() {
                    return Object.keys(scope.selection.selected).map(function (index) {
                        return scope.rows[index];
                    });
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
                scope.showActionsMenu = (scope.options.actionButtons || []).some(function (button) {
                    return button.dropdown === true;
                });
                scope.actionActive = function actionActive(button) {
                    return button.onSelection && !!scope.selectionLength() ||
                        !button.onSelection && (!button.cardinality || button.cardinality === scope.selectionLength());
                };
                scope.fireAction = function fireAction(button) {
                    if (!scope.actionActive(button)) {
                        return;
                    }
                    var locals = {
                        $scope: scope,
                        selection: scope.getSelection()
                    };
                    var result = $injector.invoke(button.click, {}, locals);
                    if (result) {
                        $q.when(result).then($rootScope.$reload);
                    }
                };
                scope.isItemVisible = function isItemVisible(button) {
                    if (!button.visible) {
                        return true;
                    }
                    var locals = {
                        $scope: scope,
                        selection: scope.getSelection()
                    };
                    return $injector.invoke(button.visible, {}, locals);
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
                            el += '<button class="btn ' + button.class +
                            '" data-ng-click="def.buttons[' + i + '].click(row)">' + button.name + '</button>';
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
    }
]);
