'use strict';

describe('Controller: ImagesSearchCtrl', function () {

  // load the controller's module
  beforeEach(module('dockerUiApp'));

  var ImagesSearchCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ImagesSearchCtrl = $controller('ImagesSearchCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
