var http_mocks = require('node-mocks-http'),
             _ = require('underscore'),
  EventEmitter = require('events').EventEmitter;

exports.create_getRequest = function(o) {
  var params = {
    method: 'GET',
    params: {}
  }
  _(params).extend(o);
  return http_mocks.createRequest(params);
};

exports.create_response = function() {
  var res = http_mocks.createResponse({eventEmitter: EventEmitter});
  var end = res.end;
  res.end = function() {
    end();
    this.emit('end');
  }
  return res;
}
