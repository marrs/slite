module.exports = function() {
  this.get(['/partials/a', '/partials/b'], function(a, b) {
    a('placeholder_a', {name: 'Ringo'});
    b('placeholder_b');
  });
}
