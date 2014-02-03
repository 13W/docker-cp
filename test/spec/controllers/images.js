'use strict';

describe('Controller: ImagesCtrl', function () {

  // load the controller's module
  beforeEach(module('dockerUiApp'));

  var ImagesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ImagesCtrl = $controller('ImagesCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
