var slite = require('./slite'),
      mvc = require('./controller'),
       fs = require('fs')
// TODO: Modularise and unit test (and come up with better name).
function prioritiser() {
    var subroutines, total, checked_in, on_complete;

    checked_in = 0;
    function check_in() {
        if (++checked_in >= total) {
            on_complete();
        }
    };

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
    };
    return {
        when: when,
        ready: check_in
    }
}

exports.delegate = function(req, res) {
    var p = prioritiser();
    p.when(function(){
        var payload,
            filepath = slite.config.public_dir + req.url;


        console.log('public dir', slite.config.public_dir);
        fs.readFile(filepath, function(err, data) {
            try {
                if (data === undefined) {
                    var controller = mvc.controller_proto('request');
                    res.setHeader('Content-Type', 'text/html');
                    console.log('url', req.url);
                    res.write(controller.get(req.url));
                } else {
                    res.setHeader('Content-Type', mime.lookup(filepath) || 'text/plain');
                    res.write(data);
                }
                res.statusCode = 200;
                p.ready();
            } catch (e) {
                res.statusCode = 404;
                console.error('foobar', e);
                p.ready();
            }
        });
    }).ready(function() {
        console.log('ooheor');
        res.end();
    });
}
