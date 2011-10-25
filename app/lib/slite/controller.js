var slite = require('./slite'),
    sys   = require('sys'),
    fs    = require('fs'),
    default_action = 'index',		// TODO: Move to config.
	default_controller = '/index',	// TODO: Move to config.
	default_format = '.html';		// TODO: Move to config.

function debug(name, val) {
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

exports.controller_proto = controller_proto;

function controller_proto(request) {
	function find_controller(path, tail) {
		if (file_exists(slite.root('/controllers' + path + '.js'))) {
			return {path: path, tail: tail};
		} else {
			var parts = path_to_array(path),
				part;
			if (parts.length) {
				part = parts.pop();
				if (part) {
					tail.unshift(parts.pop());
				}
			}
			path = parts.join('/');
			if (path && path !== '') {
				return find_controller('/' + path, tail);
			} else {
				return file_exists(slite.root('/controllers' + default_controller + '.js'))?
					{path: default_controller, tail: tail}  :  false;
			}
		}
	}
	return {
		request: request,
		view: {},
		actions: {},
		url: {},
		get: function(resource, partial){
			debug('resource', resource);
			var url = require('url').parse(resource, true),
				controller_info = find_controller(url.pathname, []),
				parts = resource.split('/'),
				action = parts.pop();
            if (controller_info === false) {
                console.log('Default controller not found. Path:', url.pathname);
                throw "500";
            }
			controller_info.url = url;
			debug('controller_info:', otos(controller_info));
			// XXX This is wrong!  this.format sets the format for the whole
			// controller.  We want to set the format for each action.
			this.format = this.format || default_format;
			debug('format', this.format);
			/* TODO: Validate signatures:
			* get(resource);                   Default view
			*/
			/*
			* get(resource, {});               Object			// DONE
			 */
			if (partial === {}) return this.view;
			if (typeof partial === 'object') {
				controller_info.url.query = partial;
			}
			if (typeof partial === 'String') {
				// TODO: If filename exists, use template, otherwise try partial using
				// default extension.  If still fails, throw 404.
			}
			/*
			* get(resource, 'partial');        Speficied view
			* get(resource, 'partial.ext');    If an extension is given then this
			*                                  is looked up for this and all child
			*                                  resources.  If no extension is given
			*                                  default extension is presumed.
			*                                  If both a resource ext and partial ext
			*                                  are given, partial ext overrides.
			*/


			if ( ! controller_info) {
				throw "404";
			}
			var controller = dispatch_controller(this, controller_info);

			return supplant_template(
				controller_info.path + '/' + controller.called_action + this.format,
				controller.view
			);
		}
	};
};

function path_to_array(path) {
	if (path === '/') {
		return [];
	}
	debug('path ' + path);
	var parts = path.split('/');
	parts.shift();
	return parts;
}

function require_controller(c) {
	return require(slite.root('/controllers' + c));
}

function file_exists(filename) {
	try { var file = fs.statSync(filename); }
	catch (e) { return false; }
	return file instanceof fs.Stats? file.isFile()  :  false;
}


function dispatch_controller(controller, c) {
	// TODO: make this a private method of controller_proto.
	var actions = require_controller(c.path).controller,
	    resource = c.path,
	    format = '',
	    action = '';
	debug("Tail:", c.tail);
	debug("ACTIONS?", otos(actions));
	// XXX What does this do?
	actions.call(controller);
	if (c.tail.length) {
		if (c.tail[1] && c.tail[1].indexOf('.') == 0) {
			format = c.tail[1];
			action = c.tail[0];
		} else if (c.tail[0].indexOf('.') == 0) {
			format = c.tail[0]; 
			action = default_action;
		} else {
			action = c.tail[0];
		}
	} else {
		debug('using default action:', default_action);
		action = default_action;
	}
	controller.url = c.url;
	debug("Controller URL:", otos(controller.url));
	debug("Controller Actions:", otos(controller.actions));
	controller.actions[action].call(controller);
	controller.called_action = action;
	return controller;
}

function supplant_template(template_location, model) {
	var template = fs.readFileSync(slite.root('/views' + template_location),
	                               'utf8');
	return template.supplant(model);
}
