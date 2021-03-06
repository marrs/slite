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

var _ = require('underscore'),
  sys = require('util'),
  format = require('./util/path-formatters');

var config = {
    app_root: './',
    public_root: 'public'
};

if (process.env.SLITE_CONFIG) {
  _(config).extend(require(process.env.SLITE_CONFIG));
}

exports.root = function(path) {
  if (config.app_root.indexOf('/') === 0) {
    return config.app_root + path;
  }
	return process.cwd() + '/' + config.app_root + path;
}

exports.assets_root = function(path) {
  var public_root = config.public_root;
  if (public_root[0] === '/') {
    return public_root + path;
  }
	return exports.root(format.leading_slash(format.concat_paths(public_root, path)));
};

exports.debug = function() {
    var i, len, val,
        args   = arguments,
        output = [];

    for (i=0, len=args.length, val=args[i]; i<len; val=args[++i]) {
        output[i] = typeof val === 'object'? otos(val): val;
    }
	console.log(output.join('\t'));
}

function otos(o, depth) {
	// Object to string (pretty-print formatted).
	// TODO: There's probably a json formatter that can replace this.
	var s = "{\n";
	depth = depth || 1;

	function tabs(depth) {
		var s = "";
		for (var i=0; i<depth; i++) {
			s += "\t";
		}
		return s;
	}

	function name(n, depth) {
		return tabs(depth) + n + ": ";
	}
	for (var i in o) {
		if (typeof o[i] == 'object') {
			s += name(i, depth) + otos(o[i], depth+1);
		} else {
			s += name(i, depth) + o[i] + "\n";
		}
	}
	s += tabs(depth-1) + "}\n";
	return s;
}

exports.otos = otos;

exports.config = config;
