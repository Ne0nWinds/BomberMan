const World = function() {
	this.mapKey = {
		"0": "rgba(0,0,0,1)",
		"1": "white",
	}

	this.player = new Player("red");
	this.map = [];
	this.spawn_points = [];
	this.tile_size = 64;
	this.generateMap = function (SizeX,SizeY) {
		let i, j;
		for (i = 0; i < SizeY; i++) {
			this.map.push([])
			for (j = 0; j < SizeX; j++) {
				this_point = i%2 * j%2;
				this.map[i].push(this_point)
				if (!this_point) this.spawn_points.push({y:i,x:j}); 
			}
		}
	}

	this.collideTile = function(object) {
        for (let y = 0; y < 2; y++) {
            for (let x = 0; x < 2; x++) {
                current_x = Math.floor((object.x + x * object.width) / this.tile_size)
                current_y = Math.floor((object.y + y * object.height)  / this.tile_size)
                old_x = Math.floor((object.old_x + x * object.width) / this.tile_size)
                old_y = Math.floor((object.old_y + y * object.height)  / this.tile_size)

				if (this.map[current_y][old_x] == 1) {
					if (object.velocity_y > 0) {
						object.y = current_y * this.tile_size - object.height - 0.01;
					} else if (object.velocity_y < 0) {
						object.y = current_y * this.tile_size + this.tile_size + 0.1;
					}
				}


				if (this.map[old_y][current_x] == 1) {
					if (object.velocity_x > 0) {
						object.x = current_x * this.tile_size - object.width - 0.1;
					} else if (object.velocity_x < 0) {
						object.x = current_x * this.tile_size + this.tile_size + 0.1;
					}   
				}

			}
		}
	}

	this.spawnPlayer = function(object) {
		let currentSpawn = this.spawn_points[randInt(0,this.spawn_points.length - 1)];
		this.player.x = currentSpawn.x * this.tile_size + ((this.tile_size - this.player.width)/2);
		this.player.y = currentSpawn.y * this.tile_size + ((this.tile_size - this.player.height)/2);
		this.player.alive = true;
	};

	this.update = function() {
		this.collideTile(this.player)
		this.player.velocity_y = 0;
		this.player.velocity_x = 0;
	}
}

const Player = function(color,x=64,y=64) {
	this.color = color;
	this.x = x;
	this.y = y;
	this.old_x = x;
	this.old_y = y;
	this.width = 36;
	this.height = 36;
	this.velocity_x = 0;
	this.velocity_y = 0;
	this.alive = false;

	this.move = function(speed, mod, angle) {
		if (this.alive) {
			this.old_x = this.x;
			this.old_y = this.y;
			this.velocity_x = Math.cos(angle);
			this.velocity_y = Math.sin(angle);
			this.x += this.velocity_x * speed * 1/mod;
			this.y += this.velocity_y * speed * 1/mod;
		}
	}

}
