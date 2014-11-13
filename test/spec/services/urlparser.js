'use strict';

describe('Service: urlparser', function () {

  // load the service's module
  beforeEach(module('dockerUiApp'));

  // instantiate service
  var urlparser;
  beforeEach(inject(function (_urlparser_) {
    urlparser = _urlparser_;
  }));

  it('should do something', function () {
    expect(!!urlparser).toBe(true);
  });

});
