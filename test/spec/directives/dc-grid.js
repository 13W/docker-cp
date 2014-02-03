'use strict';

describe('Directive: dcGrid', function () {

  // load the directive's module
  beforeEach(module('dockerUiApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<dc-grid></dc-grid>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the dcGrid directive');
  }));
});
