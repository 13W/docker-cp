'use strict';

describe('Filter: shortTag', function () {

  // load the filter's module
  beforeEach(module('dockerUiApp'));

  // initialize a new instance of the filter before each test
  var shortTag;
  beforeEach(inject(function ($filter) {
    shortTag = $filter('shortTag');
  }));

  it('should return the input prefixed with "shortTag filter:"', function () {
    var text = 'angularjs';
    expect(shortTag(text)).toBe('shortTag filter: ' + text);
  });

});
