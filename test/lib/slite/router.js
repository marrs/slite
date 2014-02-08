var expect = require('chai').expect;
var stream = require('stream');
var router = require('../../../lib/slite/router');
var EventEmitter = require('events').EventEmitter;
var http_mocks = require('../../mocks/http');
var config = require('../../../lib/slite/slite').config;
var test_root = require('../../util').test_root;

describe('router', function() {
  describe('.delegate', function() {
    it ('returns 404 if resource cannot be found', function(done) {
      var request = http_mocks.create_getRequest({ url: '/null' });
      var response = http_mocks.create_response();

      response.on('end', function() {
        expect(response.statusCode).to.eq(404);
        done();
      });

      router.delegate(request, response);
    });

    it ('serves resource from assets directory if it is present', function(done) {
      config.public_root = test_root('/stubs');
      var request = http_mocks.create_getRequest({ url: '/asset.txt' });
      var response = http_mocks.create_response();

      response.on('end', function() {
        expect(response.statusCode).to.eq(200);
        expect(response._getData()).to.eq('This is a text asset.\n');
        done();
      });

      router.delegate(request, response);
    });

    it ('servers resources from controller if static content is not present', function(done) {
      config.app_root = __dirname + '/../..';
      var request = http_mocks.create_getRequest({ url: '/asset.txt' });
      var response = http_mocks.create_response();
      response.on('end', function() {
        expect(response.statusCode).to.eq(200);
        done();
      });

      router.delegate(request, response);
    });
  });
});
