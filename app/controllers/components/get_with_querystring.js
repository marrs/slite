// An example of retreiving data with a query string.

exports.controller = function(){
	function index() {
		this.view.name = this.url.query.name;
		this.view.age = this.url.query.age;
	}

	this.actions = {
		index: index
	}
};
