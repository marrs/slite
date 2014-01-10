var format = require('../../../../lib/slite/util/path-formatters');
var expect = require('chai').expect;

describe('path-formatters', function() {
  describe('#omit_leading_slash', function() {
    it('removes a leading slash to a string if it is present', function() {
      expect(format.omit_leading_slash('/path')).to.eq('path');
    });
    it('leaves any trailing slashes in place', function() {
      expect(format.omit_leading_slash('path/')).to.eq('path/');
    });
  });

  describe('#leading_slash', function() {
    it('adds a leading slash to a string if it is not present', function() {
      expect(format.leading_slash('path')).to.eq('/path');
    });

    it('leaves any trailing slashes in place', function() {
      expect(format.leading_slash('path/')).to.eq('/path/');
    });
  });

  describe('#omit_trailing_slash', function() {
    it('removes a trailing slash from a string if it is present', function() {
      expect(format.omit_trailing_slash('path/')).to.eq('path');
    });
    it('leaves any leading slashes in place', function() {
      expect(format.omit_trailing_slash('/path')).to.eq('/path');
    });
  });

  describe('#trailing_slash', function() {
    it('adds a trailing slash to a string if it is not present', function() {
      expect(format.trailing_slash('path')).to.eq('path/');
    });

    it('leaves any leading slashes in place', function() {
      expect(format.trailing_slash('/path')).to.eq('/path/');
    });
  });

  describe('#concat_paths', function() {
    var nlnt = 'one/two',
        lnt  = '/one/two',
        nlt  = 'one/two/',
        lt   = '/one/two/';
        good_nlnt = 'one/two/one/two';
        good_nlt = 'one/two/one/two/';
        good_lnt = '/one/two/one/two';
        good_lt = '/one/two/one/two/';
    it('does not alter the first character of a path for only one argument', function() {
      expect(format.concat_paths(nlnt)).to.eq(nlnt);
      expect(format.concat_paths(lnt)).to.eq(lnt);
    });

    it('does not alter the last character of a path for only one argument', function() {
      expect(format.concat_paths(nlnt)).to.eq(nlnt);
      expect(format.concat_paths(nlt)).to.eq(nlt);
    });

    it('does not allow bunching of slashes in middle of string', function() {
      expect(format.concat_paths(nlt, lt)).to.eq(good_nlt);
    });
    
    it('does not miss out slashes between arguments', function() {
      expect(format.concat_paths(nlnt, nlnt)).to.eq(good_nlnt);
    });

    it('does not alter first and last characters of final string', function() {
      expect(format.concat_paths(lt, lt)).to.eq(good_lt);
    });
  });

});
