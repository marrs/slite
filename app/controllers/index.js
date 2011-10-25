exports.controller = function(){
	function index(){
		this.view.h1 = 'World';
		this.view.static_content = this.get('/components/static_content', {example: 'foo'});
		this.view.get_with_querystring = this.get('/components/get_with_querystring', {name: 'david'});
	}

	this.actions = {
		index: index
	}
};
