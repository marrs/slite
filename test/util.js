exports.test_root = function(f) {
  f = f.indexOf('/') === 0 ? f : '/' + f; 
  return __dirname + f;
}
