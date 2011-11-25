var sys = require('sys'),
    fs  = require('fs'),
    http = require('http'),
    slite = require('./slite'),
    mvc = require('./controller'),
    config = slite.config;

require.paths.unshift(config.app_root);

if (!String.prototype.supplant) {
    String.prototype.supplant = function (o) {
        return this.replace(/{([^{}]*)}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };
}


var server = http.createServer(function (req, res) {
    slite.debug('req', req.headers);
	//TODO: header should be written by delegator per request.
	res.writeHead(200, {'Content-Type': 'text/html'});
	try {
		write_line(res, delegate(req, res));
	} catch (e) {
		write_line(res, 'ERROR:');
		write_line(res, e);
	    res.end();
	}
});
server.listen(config.port, config.ip);
sys.puts('Server running at ' + config.ip + ':' + config.port + '/');

process.addListener("SIGINT", function () {
	server.close();
	sys.puts("Closing connection");
	process.exit(0)
});

function delegate (req, res) {
    var payload;
    slite.debug(config.public_dir);
    fs.readFile(config.public_dir + req.url, function(err, data) {
        if (data === undefined) {
            var controller = mvc.controller_proto('request');
            slite.debug('wtf', req.accepts);
            res.write(controller.get(req.url));
	        res.end();
        } else {
            res.write(data);
            res.end();
        }
    });
}

function write_line(res, str) {
    res.write(str + "\n");
}
