var sys = require('util'),
    fs = require('fs'),
    http = require('http'),
    slite = require('./slite'),
    mvc = require('./controller'),
    router = require('./router'),
    mime = require('mime'),
    config = slite.config;

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
    console.log('request path:', req.url);
    console.log('request method:', req.method);
    router.delegate(req, res);
});
server.listen(config.port, config.ip);
sys.puts('Server running at ' + config.ip + ':' + config.port + '/');

process.addListener("SIGINT", function () {
    process.stdout.write("Closing connection...");
    server.close();
    sys.puts("Done");
    process.exit(0)
});

function write_line(res, str) {
    res.write(str + "\n");
}
