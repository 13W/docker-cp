'use strict';

describe('Controller: CreatecontainerCtrl', function () {

  // load the controller's module
  beforeEach(module('dockerUiApp'));

  var CreatecontainerCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CreatecontainerCtrl = $controller('CreatecontainerCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
