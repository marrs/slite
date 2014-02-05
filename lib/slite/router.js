var controller = require('./controller')
  ,      slite = require('./slite')
  ,       mime = require('mime')
  ,        asy = require('async')
  ,         fs = require('fs')

var default_controller = '/index';   // TODO: Move to config.

function validate_request(name, val) {
  var options = {
    method: ['GET', 'POST', 'PUT', 'DELETE']
  };

  if (options[name].indexOf(val) > -1) {
    return val ;
  } else {
    throw new Error();
  }
}

function sanitize_request(req) {
  try {
    var internal_req = {
      method: validate_request('method', req.method),
      type: 'html',
      path: req.url
    };
    return internal_req;
  } catch (e) {
    return false;
  }
}
exports.delegate = function(req, res) {
    var payload,
        filepath = slite.assets_root(req.url);

    fs.readFile(filepath, function(err, data) {
        if (err) {
            res.setHeader('Content-Type', 'text/html');
            var ctl = controller.new(sanitize_request(req), function(err, payload){
                if (err) {
                    console.error('dispatch error', err);
                    res.statusCode = 500;
                    if (err.statusCode === 'ENOENT') {
                        res.statusCode = 404;
                    }
                    res.end();
                } else {
                    res.write(payload);
                    res.statusCode = 200;
                    res.end();
                }
            });
        } else {
            res.setHeader('Content-Type', mime.lookup(filepath) || 'text/plain');
            res.statusCode = 200;
            res.write(data);
            res.end();
        }
    });
};

function path_to_array(path) {
    if (path === '/') {
        return [];
    }
    var parts = path.split('/');
    parts.shift();
    return parts;
}


