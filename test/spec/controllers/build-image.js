'use strict';

describe('Controller: BuildimageCtrl', function () {

  // load the controller's module
  beforeEach(module('dockerUiApp'));

  var BuildimageCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    BuildimageCtrl = $controller('BuildimageCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
