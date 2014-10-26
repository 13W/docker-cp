'use strict';

describe('Controller: DestroyCtrl', function () {

  // load the controller's module
  beforeEach(module('dockerUiApp'));

  var DestroyCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DestroyCtrl = $controller('DestroyCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
