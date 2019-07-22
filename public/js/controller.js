const KeyboardController = function(upBtn,leftBtn,downBtn,rightBtn) {

	this.up = this.down = this.left = this.right = false;

	this.angle = 0;
	this.mod = 1;
	this.enabled = false;
	
	this.update = (event) => {
		switch(event.key) {
			case leftBtn: this.left = (event.type == "keydown"); break;
			case rightBtn: this.right = (event.type == "keydown"); break;
			case upBtn: this.up = (event.type == "keydown"); break;
			case downBtn: this.down = (event.type == "keydown"); break;
		}
		this.angle = Math.atan2(this.down - this.up,this.right - this.left);
		this.enabled = (this.up || this.down || this.left || this.right) ? true : false;
	}

}

const GamePadController = function() {

	this.angle = 0;
	this.mod = 0;
	this.enabled = false;

	this.update = () => {
		let gp = navigator.getGamepads()[0]
		if (gp != null) {
			this.angle = Math.atan2(gp.axes[1],gp.axes[0]);
			this.mod = Math.min(Math.pow((Math.pow(gp.axes[0],2) + Math.pow(gp.axes[1],2)),0.5), 1)
			this.enabled = (this.mod > 0.25) ? true : false;
			this.mod = (this.mod - 0.25) / 0.75;
		}
	}

}
