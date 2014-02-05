var controller = require('../../../lib/slite/controller')
  ,     expect = require('chai').expect
  ,      slite = require('../../../lib/slite/slite')

var test_root = require('../../util').test_root;

describe('controller', function() {
  slite.config.app_root = test_root('/fixtures');

  var mock_request = {
    method: 'GET',
    type: 'html',
    path: '/partials/a'
  }

  describe('new', function(){
    it('Provides a system controller instance given a request object', function() {
      var ctl = controller.new(mock_request, function(){});
      expect(ctl).to.be.an('object');
    });
  });

  describe('resolve', function() {

    it('provides the view associated with a user controller', function(done) {

      var ctl = controller.new(mock_request, function(err, rsp){
        expect(rsp).to.eq('Name: {name}\n');
        done();
      });
    });

    it('binds the model to the view associated with a user controller', function(done) {

      mock_request.path = '/partials/b';
      var ctl = controller.new(mock_request, function(err, rsp){
        expect(rsp).to.eq('Name: Ringo\n');
        done();
      });
    });

    it('resolves dependencies of controller', function(done) {
      mock_request.path = '/partials/c';
      var ctl = controller.new(mock_request, function(err, rsp) {
        expect(rsp).to.eq('Name: Ringo\n\n');
        done();
      });
    });

    it('throws an error if it cannot find the template', function(done) {
      mock_request.path = '/partials/d';
      var ctl = controller.new(mock_request, function(err, rsp) {
        expect(err.code).to.eq('ENOENT');
        expect(err.path).to.eq(test_root('/fixtures/views/partials/d.html'));
        done();
      });
    })
  });
});
