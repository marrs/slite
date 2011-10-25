var sys = require('sys'),
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
	//TODO: header should be written by delegator per request.
	res.writeHead(200, {'Content-Type': 'text/html'});
	function line(str) {
		res.write(str + "\n");
	}
	line(req.url);
	line(req.method);
	try {
		line(delegate(req));
	} catch (e) {
		line('ERROR:');
		line(e);
	}
	res.end("fin\n");
});
server.listen(config.port, config.ip);
sys.puts('Server running at ' + config.ip + ':' + config.port + '/');

process.addListener("SIGINT", function () {
	server.close();
	sys.puts("Closing connection");
	process.exit(0)
});

function delegate (req) {
    var controller = mvc.controller_proto('request');
	sys.puts('Getting', req.url);
	return controller.get(req.url);
}
