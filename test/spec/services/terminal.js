'use strict';

describe('Service: terminal', function () {

  // load the service's module
  beforeEach(module('dockerUiApp'));

  // instantiate service
  var terminal;
  beforeEach(inject(function (_terminal_) {
    terminal = _terminal_;
  }));

  it('should do something', function () {
    expect(!!terminal).toBe(true);
  });

});
