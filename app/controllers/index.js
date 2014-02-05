exports.get = function(){
		this.view.h1 = 'World';
    this.get(['/components/static_content',
              '/components/get_with_querystring'], function(a, b) {
        a('static_content', {example: 'foo'});
        b('get_with_querystring', {name: 'david'});
    });
};
