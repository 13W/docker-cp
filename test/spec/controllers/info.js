'use strict';

describe('Controller: InfoCtrl', function () {

  // load the controller's module
  beforeEach(module('dockerUiApp'));

  var InfoCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InfoCtrl = $controller('InfoCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
