var config = require(process.env.SLITE_CONFIG),
    sys    = require('sys');

exports.root = function(path) {
	return config.app_root + path;
}

exports.debug = function(name, val) {
    if (typeof val === 'object') {
        val = otos(val);
    }
	sys.puts(name + '\t' + val);
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

exports.config = {};

for (var i in config) {
    exports.config[i] = config[i];
}
