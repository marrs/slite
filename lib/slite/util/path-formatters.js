exports.omit_leading_slash = function (path) {
  return path[0] === '/'? path.substr(1) : path;
}

exports.leading_slash = function (path) {
  return path[0] === '/'? path : '/' + path;
}

exports.omit_trailing_slash = function (path) {
  return path[path.length-1] === '/'? path.substr(0, path.length-1) : path;
}

exports.trailing_slash = function (path) {
  return path[path.length-1] === '/'? path : path + '/';
}

exports.concat_paths = function () {
  if (arguments.length < 2) {
    return arguments[0];
  }
  var i, len, parts = [];
  parts[0] = exports.omit_trailing_slash(arguments[0]);
  for (i = 1, len = arguments.length; i < len - 1; ++i) {
    parts[i] = exports.omit_leading_slash(exports.omit_trailing_slash(arguments[i]));
  }
  parts[len-1] = exports.omit_leading_slash(arguments[len-1]);
  return parts.join('/');
}
