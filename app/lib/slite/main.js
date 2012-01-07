var sys = require('util'),
    fs = require('fs'),
    http = require('http'),
    slite = require('./slite'),
    mvc = require('./controller'),
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

// TODO: Modularise and unit test (and come up with better name).
function prioritiser() {
    var subroutines, total, checked_in, on_complete;

    checked_in = 0;
    function check_in() {
        slite.debug('checking in');
        if (++checked_in >= total) {
            on_complete();
        }
    }

    function when() {
        var i;

        total       = arguments.length;
        subroutines = arguments;

        return {
            ready: function(fn) {
                on_complete = fn;
                for (i=0; i<total; i++) {
                    subroutines[i].call({});
                }
            }
        }
    }
    return {
        when: when,
        ready: check_in
    }
}


var server = http.createServer(function (req, res) {
    //TODO: header should be written by delegator per request.
    res.writeHead(200, {'Content-Type': 'text/html'});
    function line(str) {
        res.write(str + "\n");
    }
    console.log('request path:', req.url);
    console.log('request method:', req.method);
    var p = prioritiser();
    slite.debug('delegation respones', p);
    p.when(function(){
        delegate(p, req, res);
    }).ready(function() {
        console.log('ending respones');
        res.end();
    });
});
server.listen(config.port, config.ip);
sys.puts('Server running at ' + config.ip + ':' + config.port + '/');

process.addListener("SIGINT", function () {
    process.stdout.write("Closing connection...");
    server.close();
    sys.puts("Done");
    process.exit(0)
});

function delegate (p, req, res) {
    var payload;
    slite.debug('public dir', config.public_dir);
    fs.readFile(config.public_dir + req.url, function(err, data) {
        if (data === undefined) {
            var controller = mvc.controller_proto('request');
            res.write(controller.get(req.url));
            p.ready();
        } else {
            res.write(data);
            p.ready();
        }
    });
}

function write_line(res, str) {
    res.write(str + "\n");
}
