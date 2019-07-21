const KeyboardController = function(upBtn,leftBtn,downBtn,rightBtn) {

	this.up = this.left = this.down = this.right = false;
	
	this.updateKeys = (event) => {
		switch(event.key) {
			case leftBtn: this.left = (event.type == "keydown"); break;
			case rightBtn: this.right = (event.type == "keydown"); break;
			case upBtn: this.up = (event.type == "keydown"); break;
			case downBtn: this.down = (event.type == "keydown"); break;
		}
	}

}
