'use strict';

describe('Service: stream', function () {

  // load the service's module
  beforeEach(module('dockerUiApp'));

  // instantiate service
  var stream;
  beforeEach(inject(function (_stream_) {
    stream = _stream_;
  }));

  it('should do something', function () {
    expect(!!stream).toBe(true);
  });

});
