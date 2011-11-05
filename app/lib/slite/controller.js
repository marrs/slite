var slite = require('./slite'),
    sys   = require('sys'),
    fs    = require('fs'),
    default_action = 'index',		// TODO: Move to config.
	default_controller = '/index',	// TODO: Move to config.
	default_format = '.html';		// TODO: Move to config.

function debug(name, val) {
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

exports.controller_proto = controller_proto;

function controller_proto(request) {
    var my = {
        request: '',
        view: {}
    };
    if (typeof request === 'object') {
        merge(my, request);
    } else {
        my.request = request;
    }
    var priv = {
        template: false,    // Set when template is called
        template_placeholder: ''
    };
	return {
		request: my.request,
        format: default_format,
		view: my.view,
		actions: {},
		url: {},
        template: function(template_location, placeholder) {
            priv.template = template_location;
            // Placeholder string into which the controller's view is
            // supplanted.
            priv.template_placeholder = placeholder;
        },
        view_: function(p, v) {
            this.view[p] = this.view[p] || v;
        },
		get: function(resource, partial){

			var url = require('url').parse(resource, true),
                controller_info = {},
				split_pathname = find_controller(url.pathname, []),
				parts = resource.split('/'),
				action = parts.pop();
            if (split_pathname === false) {
                console.log('Default controller not found. Path:', url.pathname);
                throw "500";
            }
			controller_info.url = url;
            controller_info.path = split_pathname.path;
            merge(controller_info, find_action(split_pathname.tail));
			// XXX This is wrong!  this.format sets the format for the whole
			// controller.  We want to set the format for each action.
			this.format = this.format || default_format;
			//debug('format', this.format);
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
			dispatch_controller(this, controller_info);

            // TODO: Check if template_location has an extension (e.g. .html),
            // otherwise append this.format.
			var this_component = supplant_template(
				controller_info.path + '/' + this.called_action + this.format,
				this.view
			);

            if ( ! priv.template ) {
                return this_component;
            }
            var view = {};

            view[priv.template_placeholder] = this_component;
            for (var i in this.view) {
                if (i.charAt(0) === '_') {
                    view[i.substring(1)] = this.view[i];
                }
            };

            var tpl_controller = controller_proto({
                request: priv.template,
                view: view
            });
            return tpl_controller.get(priv.template);
		},


	};
};

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
function find_action(tail) {
    var action, format;
    if (tail.length) {
        if (tail[1] && tail[1].indexOf('.') == 0) {
            format = tail[1];
            action = tail[0];
        } else if (tail[0].indexOf('.') == 0) {
            format = tail[0]; 
            action = default_action;
        } else {
            action = tail[0];
        }
    } else {
        debug('using default action:', default_action);
        action = default_action;
    }
    return {
        action: action,
        format: format
    }
}

function path_to_array(path) {
	if (path === '/') {
		return [];
	}
	var parts = path.split('/');
	parts.shift();
	return parts;
}

function require_controller(c) {
    // TODO XXX Require only gets it once.  We need to load
    // the file on every request, at least in debug mode.
	return require(slite.root('/controllers' + c));
}

function file_exists(filename) {
	try { var file = fs.statSync(filename); }
	catch (e) { return false; }
	return file instanceof fs.Stats? file.isFile()  :  false;
}

function dispatch_controller(proto, meta) {
    var ctrl = require_controller(meta.path).controller,
        resource = meta.path;
    ctrl.call(proto);
    proto.url = meta.url;
    proto.actions[meta.action].call(proto);
    proto.called_action = meta.action;
}

function supplant_template (template_location, model) {
    var tpl, view;
    tpl= fs.readFileSync(slite.root('/views' + template_location),
                           'utf8');
    view = tpl.supplant(model);
    return view;
}

function merge(o1, o2) {
    for (var i in o2) {
        o1[i] = o2[i];
    }
}

