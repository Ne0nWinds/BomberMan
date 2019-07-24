const Display = function(canvas,bufferWidth,bufferHeight) {

	this.context = canvas.getContext("2d")
	this.buffer = document.createElement("canvas").getContext("2d")
	this.mapBuffer = document.createElement("canvas").getContext("2d", {alpha:false})
	this.crateBuffer = document.createElement("canvas").getContext("2d", {alpha:true})
	this.crateBuffer.canvas.width = this.mapBuffer.canvas.width = this.buffer.canvas.width = bufferWidth;
	this.crateBuffer.canvas.height = this.mapBuffer.canvas.height = this.buffer.canvas.height = bufferHeight;

	this.fill = function(color) {

        this.buffer.fillStyle = color;
        this.buffer.fillRect(0,0,this.buffer.canvas.width,this.buffer.canvas.height);

    };

	this.drawMap = function(map,img,tile_size) {
		let height = map.length;
		let width = map[0].length;
		let x, y;
		
		for (y = 0; y < height; y++) {
			for (x = 0; x < width; x++) {
				if (!map[y][x]) {
//					this.mapBuffer.fillStyle = "#eae7c7";
					this.mapBuffer.drawImage(img,x*tile_size,y*tile_size);
				} else {
        			this.mapBuffer.fillStyle = "brown";
				}
				this.mapBuffer.fillRect(x*tile_size,y*tile_size,tile_size,tile_size);
			}
		}
	}

	this.drawItemMap = function(map,img,tile_size) {
		let height = map.length;
		let width = map[0].length;
		let x, y;
		
		for (y = 0; y < height; y++) {
			for (x = 0; x < width; x++) {
				if (map[y][x]) {
					this.crateBuffer.drawImage(img,x*tile_size,y*tile_size);
				} else {
					this.crateBuffer.clearRect(x*tile_size,y*tile_size,tile_size,tile_size);
				}
			}
		}
	}

	this.destroyCrate = function(x,y,tile_size) {
		this.crateBuffer.clearRect(x*tile_size,y*tile_size,tile_size,tile_size)
	}

	this.clear = function() {
		this.buffer.clearRect(0,0,this.buffer.canvas.width,this.buffer.canvas.height);
	}

    this.drawRectangle = function(x,y,w,h,color) {
        this.buffer.fillStyle = color;
        this.buffer.fillRect(Math.round(x),Math.round(y),w,h);

    };

	this.drawImage = function(img,x,y) {
		this.buffer.drawImage(img,x,y);
	};

    this.render = function(top=16,right=16,zoomLevel) {
		this.context.clearRect(0,0,this.context.canvas.width,this.context.canvas.height);
		this.context.drawImage(this.mapBuffer.canvas,right*-1,top*-1,this.buffer.canvas.width * zoomLevel,this.buffer.canvas.height * zoomLevel);
		this.context.drawImage(this.crateBuffer.canvas,right*-1,top*-1,this.buffer.canvas.width * zoomLevel,this.buffer.canvas.height * zoomLevel);
		this.context.drawImage(this.buffer.canvas,right*-1,top*-1,this.buffer.canvas.width * zoomLevel,this.buffer.canvas.height * zoomLevel);
    };


	this.resize = function(w,h,w_ratio,h_ratio) {
		this.context.canvas.width = w;
		this.context.canvas.height = h;
/*		if (h/w > h_ratio/w_ratio) {
			w -= w % (w_ratio * h_ratio)
			this.context.canvas.width = w;
			this.context.canvas.height = w * (h_ratio/w_ratio)
		} else {
			h -= h % (w_ratio * h_ratio)
			this.context.canvas.height = h;
			this.context.canvas.width = h * (w_ratio/h_ratio)
		} */

		this.context.imageSmoothingEnabled = false;
	}

}
