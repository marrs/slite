var expect = require('chai').expect;
var stream = require('stream');
var router = require('../../../lib/slite/router');
var EventEmitter = require('events').EventEmitter;
var http_mocks = require('../../mocks/http');

describe('delegate', function() {
  it ('Returns 404 if resource cannot be found', function() {
    var request = http_mocks.create_getRequest({ url: '/null' });
    var response = http_mocks.create_response();

    response.on('end', function() {
      expect(response.statusCode).to.eq(404);
    });

    router.delegate(request, response);
  });
});
