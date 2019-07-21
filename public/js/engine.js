const Engine = function(frame_rate, update, render) {
	this.update = update;
	this.render = render;
	this.last_update = null;
	this.frame_step = 1000/frame_rate;
	this.time_delta = 1;

	this.run = function() {
		window.requestAnimationFrame(this.handleRun)
		this.update();
		this.render();
		let perf = window.performance.now()
		this.time_delta = (perf - this.last_update) / this.frame_step;
		this.last_update = perf;
	}
	this.handleRun = () => {
		this.run()
	}
	this.start = function() {
		window.requestAnimationFrame(this.handleRun)
		this.last_update = window.performance.now();	
	}
}
