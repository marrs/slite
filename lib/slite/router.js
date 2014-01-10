var slite = require('./slite'),
     mime = require('mime'),
      mvc = require('./controller'),
       fs = require('fs')

exports.delegate = function(req, res) {
    var payload,
        filepath = slite.assets_root(req.url);

    fs.readFile(filepath, function(err, data) {
        if (err) {
            try {
                var controller = mvc.controller_proto('request');
                res.setHeader('Content-Type', 'text/html');
                res.write(controller.get(req.url));
                res.statusCode = 200;
                res.end();
            } catch (e) {
                if (err.code === 'ENOENT') {
                    res.statusCode = 404;
                }
                res.end();
            }
        } else {
            res.setHeader('Content-Type', mime.lookup(filepath) || 'text/plain');
            res.statusCode = 200;
            res.write(data);
            res.end();
        }
    });
}
