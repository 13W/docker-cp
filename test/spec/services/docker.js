'use strict';

describe('Service: Docker', function () {

  // load the service's module
  beforeEach(module('dockerUiApp'));

  // instantiate service
  var Docker;
  beforeEach(inject(function (_Docker_) {
    Docker = _Docker_;
  }));

  it('should do something', function () {
    expect(!!Docker).toBe(true);
  });

});
