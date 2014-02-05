// There are 2 kinds of controller: user and system.
//
// -- User --
// This is the controller that the user creates and uses
// to handle requests from the router.
//
// -- System --
// This is used by the system to run the user controller
// and (amongst other things) create the payload that is
// returned to the browser.
// 
// It exists because there are some methods that we do not
// want the user to have access to, which he would get through
// the prototype chain if there were only one controller.

var slite = require('./slite'),
    sys   = require('util'),
    fs    = require('fs'),
    when  = require('./when'),
    default_action = 'index',        // TODO: Move to config.
    default_controller = '/index',   // TODO: Move to config.
    default_format = '.html';        // TODO: Move to config.

var usrcon_proto = {
  view: {}
};

// Used to home methods that we don't want the user to have
// access to directly (via the user controller), but are
// useful to other parts of the system controlling the user
// controller.
function Syscon(request, cbComplete) {
  var pending_controllers = {}; // Router registers known controllers here
                                // while it goes in search of them. When it
                                // finds them, it will move them to found
                                // controllers.

  var found_controllers = {};   // These controllers have been read and are
                                // ready for processing.

  var _this = this;

  function resolve(path, view, cb) {
    if (request.method === 'GET') {
      render(path || request.path, view, cb || function(){});
    }
  };

  // Create the functions that are passed to the callback of
  // usrcon.get.
  // 1st arg - property:
  //   the view property to bind the payload to.
  // 2nd arg - dep_view:
  //   an object containing properties you wish
  //   to override the dependent's view object with.
  function build_dep_resolve(parent_path, path, view) {
    return function(property, dep_view) {
      resolve(path, null, function(err, payload) {
        if (found_controllers[parent_path]) {
          var o = {};
          o[property] = payload;
          var parent_ctl = found_controllers[parent_path];
          parent_ctl.payload = parent_ctl.payload.supplant(o);
        } else {
          pending_controllers[parent_path].view[property] = payload;
        }
      });
    };
  }

  function resolve_deps(parent_path, deps, view, cb) {
    var components = [];

    when.iterator(deps, function(val, i, step) {
      components[i] = build_dep_resolve(parent_path, val, view);
      step.done();
    }).done(function() {
      cb.apply(_this, components);
    }).go();
  };

  function register_controller_complete(path, controller, payload) {
    found_controllers[path] = {
      controller: controller,
      payload: payload
    }
    delete pending_controllers[path];
    for (var i in pending_controllers) {
      if (pending_controllers[i]) return;
    }
    cbComplete(null, found_controllers[request.path].payload);
  }

  function render(path, view, cb) {
    pending_controllers[path] = true; // Dispatch registered. Awaiting reply
    find_template(path + '.' + request.type, function(err, tpl) {
      if (err) { cbComplete(err); return; }
      var Ctl = require_controller(path).get;
      Ctl.prototype = usrcon_proto;
      Ctl.prototype.get = function(deps, cb) {
        resolve_deps(path, deps, this.view, cb);
      }
      var ctl = new Ctl;
      var data = tpl.supplant(view || ctl.view);
      cb(null, data);
      register_controller_complete(path, ctl, data);
    }.bind(this));
  };

  this.resolve = resolve;
  resolve();
}

exports.new = function(request, cbComplete) {
  return new Syscon(request, cbComplete);
}

function require_controller(c) {
    // TODO XXX Require only gets it once.  We need to load
    // the file on every request, at least in debug mode.
    return require(slite.root('/controllers' + c));
}

function find_template (template_location, cb) {
    var tpl, view;
    fs.readFile(
        slite.root('/views' + template_location),
        'utf8',
        function(err, tpl) {
            if (err) { cb(err); return; }
            cb(null, tpl);
        });
}
