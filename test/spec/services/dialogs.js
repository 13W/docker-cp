'use strict';

describe('Service: Dialogs', function () {

  // load the service's module
  beforeEach(module('dockerUiApp'));

  // instantiate service
  var Dialogs;
  beforeEach(inject(function (_Dialogs_) {
    Dialogs = _Dialogs_;
  }));

  it('should do something', function () {
    expect(!!Dialogs).toBe(true);
  });

});
