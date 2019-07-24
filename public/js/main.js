function randInt(min,max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}
window.addEventListener("load", function() {

	const socket = io();

	const controller = new KeyboardController("w","a","s","d"," ")
//	const controller = new GamePadController();

	const world = new World();
	world.generateMap(25,25);
	world.spawnPlayer();
	socket.emit('update_movement',{x:world.player.x,y:world.player.y,alive:world.player.alive})

	const display = new Display(document.querySelector("#canvas"),world.map[0].length * world.tile_size,world.map.length * world.tile_size)
	let c4 = document.createElement("canvas").getContext("2d")
	c4.drawImage(document.getElementById("c4"),0,0)


	const resize = function() {
		display.resize(window.innerWidth,window.innerHeight);
	}

	const update = function() {


		if (controller.placeBomb) {
			if (world.player.placeBombActive) {

				if (world.player.bombs[world.player.bombID - 3] == undefined) {
					let bombX = Math.floor(world.player.x / 64);
					let bombY = Math.floor(world.player.y / 64);
					let bombValid = true;
					for (let i in world.bombs) {
						if (i != socket.id) {
							for (let x in world.bombs[i]) {
								let b = world.bombs[i][x];
								if (b.x == bombX && b.y == bombY) {bombValid = false; break}; 
							}
						} else {
							for (let x in world.player.bombs) {
								let b = world.player.bombs[x];
								if (b.x == bombX && b.y == bombY) {bombValid = false; break}; 
							}
						}
					}
					if (bombValid) {
						world.player.bombs[world.player.bombID] = new Bomb(bombX,bombY,Date.now());
						world.player.bombID++;
						world.player.placeBombActive = false;
						socket.emit('add_bomb', {
							id: world.player.bombID - 1,
							bomb: world.player.bombs[world.player.bombID - 1],
						})
					}
				}
			}
		} else {
			world.player.placeBombActive = true;
		}
		if (controller.enabled) {
			world.player.move(5 * controller.mod,engine.time_delta,controller.angle)
			world.update();
			socket.emit('update_movement',{x:world.player.x,y:world.player.y,alive:world.player.alive})
		}
		let lu = Date.now();
		for (let i in world.bombs) {
			for (let x in world.bombs[i]) {
				if (lu - world.bombs[i][x].timeStamp > 2600) {
					world.bombs[i][x].detonated = true;
				}
			}
		}
	}
	
	const render = function() {
		display.drawMap(world.map,0,world.tile_size);

		for (let i in world.bombs) {
			if (i != socket.id) {
				for (let x in world.bombs[i]) {
					let b = world.bombs[i][x];
					display.drawImage(c4.canvas,b.x * world.tile_size + 14,b.y * world.tile_size + 14,0);
				}
			} else {
				for (let x in world.player.bombs) {
					let b = world.player.bombs[x];
					display.drawImage(c4.canvas,b.x * world.tile_size + 14,b.y * world.tile_size + 14,0);
				}
			}
		}

		if (world.player.alive) {
			display.drawRectangle(world.player.x,world.player.y,world.player.width,world.player.height,world.player.color);
		}

		for (let p in world.other_players) {
			if (p != socket.id && world.other_players[p].alive) {
				display.drawRectangle(world.other_players[p].x,world.other_players[p].y,world.player.width,world.player.height,world.player.color);
			}
		}

		display.render(world.player.y - display.context.canvas.height / 2 + 18,world.player.x - display.context.canvas.width / 2 + 18,1);
	}
	const engine = new Engine(60,update,render);
	resize();
	engine.start();

	window.addEventListener("keydown", controller.update);
	window.addEventListener("keyup", controller.update);
	window.addEventListener("resize", resize)
	socket.on('update', function (data) {
		world.other_players = data;
	});
	socket.on('update_bombs', function(data) {
		world.bombs = data;
	})
});

