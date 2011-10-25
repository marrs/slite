var config = require(process.env.SLITE_CONFIG);

exports.root = function(path) {
	return config.app_root + path;
}

exports.config = {};

for (var i in config) {
    exports.config[i] = config[i];
}
