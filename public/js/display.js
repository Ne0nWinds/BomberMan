const Display = function(canvas,contextWidth,contextHeight,bufferWidth,bufferHeight) {

	this.context = canvas.getContext("2d")
	this.buffer = document.createElement("canvas").getContext("2d")
	this.buffer.canvas.width = bufferWidth;
	this.buffer.canvas.height = bufferHeight;
	this.context.canvas.width = contextWidth;
	this.context.canvas.height = contextHeight;

	this.fill = function(color) {

        this.buffer.fillStyle = color;
        this.buffer.fillRect(0,0,this.buffer.canvas.width,this.buffer.canvas.height);

    };

	this.drawMap = function(map,mapKey,tile_size) {
		let height = map.length;
		let width = map[0].length;
		let x, y;
		
		for (y = 0; y < height; y++) {
			for (x = 0; x < width; x++) {
				this.drawRectangle(x*tile_size,y*tile_size,tile_size,tile_size,mapKey[map[y][x]])
			}
		}

	}

    this.drawRectangle = function(x,y,w,h,color) {

        this.buffer.fillStyle = color;
        this.buffer.fillRect(Math.round(x),Math.round(y),w,h);

    };

	this.drawImage = function(img,x,y) {
		this.buffer.drawImage(img,x,y);
	};

    this.render = function(top=16,right=16,zoomLevel) {
		this.context.drawImage(this.buffer.canvas,right*-1,top*-1,this.buffer.canvas.width * zoomLevel,this.buffer.canvas.height * zoomLevel)
    };


	this.resize = function(w,h,w_ratio,h_ratio) {
		if (h/w > h_ratio/w_ratio) {
//			w -= w % (w_ratio * h_ratio)
			this.context.canvas.width = w;
			this.context.canvas.height = w * (h_ratio/w_ratio)
		} else {
//			h -= h % (w_ratio * h_ratio)
			this.context.canvas.height = h;
			this.context.canvas.width = h * (w_ratio/h_ratio)
		}

		this.context.imageSmoothingEnabled = false;
	}

}
