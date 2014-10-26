'use strict';

describe('Controller: CommitCtrl', function () {

  // load the controller's module
  beforeEach(module('dockerUiApp'));

  var CommitCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CommitCtrl = $controller('CommitCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
