'use strict';

describe('Controller: ContainersCtrl', function () {

  // load the controller's module
  beforeEach(module('dockerUiApp'));

  var ContainersCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ContainersCtrl = $controller('ContainersCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
