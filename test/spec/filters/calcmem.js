'use strict';

describe('Filter: calcMem', function () {

  // load the filter's module
  beforeEach(module('dockerUiApp'));

  // initialize a new instance of the filter before each test
  var calcMem;
  beforeEach(inject(function ($filter) {
    calcMem = $filter('calcMem');
  }));

  it('should return the input prefixed with "calcMem filter:"', function () {
    var text = 'angularjs';
    expect(calcMem(text)).toBe('calcMem filter: ' + text);
  });

});
