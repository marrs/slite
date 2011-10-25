exports.controller = function(){
	function index() {
		this.view.example = "This content came from the controller.";
	}

	this.actions = {
		index: index
	}
};
