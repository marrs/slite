exports.get = function() { 
  this.get(['/partials/b'], function(a) {
    a('placeholder_b');
  });
}
