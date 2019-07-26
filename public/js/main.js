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
	socket.emit('edit_map',[
		{x:Math.floor(world.player.x / world.tile_size), y:Math.floor(world.player.y / world.tile_size)},
		{x:Math.floor(world.player.x / world.tile_size) + 1, y:Math.floor(world.player.y / world.tile_size)},
		{x:Math.floor(world.player.x / world.tile_size) - 1, y:Math.floor(world.player.y / world.tile_size)},
		{x:Math.floor(world.player.x / world.tile_size), y:Math.floor(world.player.y / world.tile_size) + 1},
		{x:Math.floor(world.player.x / world.tile_size), y:Math.floor(world.player.y / world.tile_size) - 1},
	]);

	const display = new Display(document.querySelector("#canvas"),world.map[0].length * world.tile_size,world.map.length * world.tile_size)

	let grenade = document.createElement("canvas").getContext("2d")
	grenade.drawImage(document.getElementById("grenade"),0,0)

	let bomb = document.createElement("canvas").getContext("2d")
	bomb.drawImage(document.getElementById("bomb"),0,0)

	let c4 = document.createElement("canvas").getContext("2d")
	c4.drawImage(document.getElementById("c4"),0,0)

	let fireball = document.createElement("canvas").getContext("2d")
	fireball.drawImage(document.getElementById("fireball"),0,0)

	let smoke = document.createElement("canvas").getContext("2d")
	smoke.drawImage(document.getElementById("smoke"),0,0)

	let crate = document.createElement("canvas").getContext("2d", {alpha:false})
	crate.drawImage(document.getElementById("crate"),0,0)

	let wall = document.createElement("canvas").getContext("2d", {alpha:false})
	wall.drawImage(document.getElementById("wall"),0,0)

	display.drawMap(world.map,wall.canvas,world.tile_size);
	display.drawItemMap(world.itemMap,crate.canvas,world.tile_size);

	socket.on('update', function (data) {
		world.other_players = data;
	});
	socket.on('update_bombs', function(data) {
		world.bombs = data;
	})
	socket.on('destroy_crate', function(data) {
		display.destroyCrate(data.x,data.y,world.tile_size);
		world.itemMap[data.y][data.x] = data.tile;
	});
	socket.on('update_map', function(data) {
		world.itemMap = data;
		for (let y=0; y< data.length;y++) {
			for (let x=0;x<data[0].length;x++) {
				if (data[y][x] == 0) {
					display.destroyCrate(x,y,world.tile_size);
				}
			}
		}
	});
	socket.on('update_items', function(data) {
		world.items = data;
		console.log(world.items)
	});
	socket.on('give_item', function(data) {
		if (data.type == 1) {
			if (world.player.power == 2) {
				world.player.power = 4;
			} else if (world.player.power == 4) {
				world.player.power = 7;
			}
		}
	});

	const resize = function() {
		display.resize(window.innerWidth,window.innerHeight);
	}

	const update = function() {

		let now = Date.now();
		for (let i in world.bombs) {
			if (i == socket.id) {
				world.player.bombs = world.bombs[i];
			};
			for (let x in world.bombs[i]) {
				let b = world.bombs[i][x]
				if (now - b.timeStamp > 3250) {
					delete world.bombs[i][x]
					if (i == socket.id) {delete world.player.bombs[x]};
					socket.emit('remove_bomb', { id: x, socket_id: i });
				} else if (now - b.timeStamp > 2600) {

					if (b.detonated == false) {
						let explosion = {
							left: undefined,
							right: undefined,
							down: undefined,
							up: undefined,
						};

						let crateRight;
						for (let h = b.x + 1; h <= b.x + b.power;h++) {
							if (world.map[b.y][h] == 1) {
								explosion.right = h - 1;
								break;
							}
							if (world.itemMap[b.y][h] == 1) {
								crateRight = {x:h,y:b.y};
								explosion.right = h;
								break;
							}
						}
						if (explosion.right == undefined) {
							explosion.right = b.x + b.power;
						}

						let crateLeft;
						for (let h = b.x - 1; h >= b.x - b.power;h--) {
							if (world.map[b.y][h] == 1) {
								explosion.left = h + 1;
								break;
							}
							if (world.itemMap[b.y][h] == 1) {
								crateLeft = {x:h,y:b.y};
								explosion.left = h;
								break;
							}
						}
						if (explosion.left == undefined) {
							explosion.left = b.x - b.power;
						}

						let crateUp;
						for (let h = b.y - 1; h >= b.y - b.power;h--) {
							if (!world.map[h] || world.map[h][b.x] == 1) {
								explosion.up = h + 1;
								break;
							}
							if (world.itemMap[h][b.x] == 1) {
								crateUp = {x:b.x,y:h};
								explosion.up = h;
								break;
							}
						}
						if (explosion.up == undefined) {
							explosion.up = b.y - b.power;
						}

						let crateDown;
						for (let h = b.y + 1; h <= b.y + b.power;h++) {
							if (!world.map[h] || world.map[h][b.x] == 1) {
								explosion.down = h - 1;
								break;
							}
							if (world.itemMap[h][b.x] == 1) {
								crateDown = {x:b.x,y:h};
								explosion.down = h;
								break;
							}
						}
						if (explosion.down == undefined) {
							explosion.down = b.y + b.power;
						}

						world.bombs[i][x].crateRight = crateRight;
						world.bombs[i][x].crateLeft = crateLeft;
						world.bombs[i][x].crateUp = crateUp;
						world.bombs[i][x].crateDown = crateDown;
						world.bombs[i][x].detonated = true;
						world.bombs[i][x].explosion = explosion;

						socket.emit('detonate_bomb', 
						{
							id: x,
							socket_id: i,
							crateRight:crateRight,
							crateLeft:crateLeft,
							crateUp:crateUp,
							crateDown:crateDown,
							explosion:explosion
						});
					}

					let p = world.player;
					if (p.alive && now - b.timeStamp < 2750) {
						for (let y = 0; y < 2;y++) {
							for (let x = 0; x < 2;x++) {
								let playerTileX = Math.floor((p.x + x * p.width) / world.tile_size);
								let playerTileY = Math.floor((p.y + y * p.height) / world.tile_size);

								if (playerTileX >= b.explosion.left && playerTileX <= b.explosion.right && playerTileY == b.y) {
									world.player.alive = false;
									socket.emit('update_movement',{x:world.player.x,y:world.player.y,alive:world.player.alive})
								}
								if (playerTileY >= b.explosion.up && playerTileY <= b.explosion.down && playerTileX == b.x) {
									world.player.alive = false;
									socket.emit('update_movement',{x:world.player.x,y:world.player.y,alive:world.player.alive})
								}
							}
						}
					}
				} 
			}
		}

		if (world.player.power != 7) {
			for (let i in world.items) {
				let item = world.items[i]
				let playerTileX = Math.floor((world.player.x + world.player.width / 2) / world.tile_size);
				let playerTileY = Math.floor((world.player.y + world.player.height / 2) / world.tile_size);
				if (item.x == playerTileX && item.y == playerTileY) {
					socket.emit('remove_item', {id:i});
				}
			}
		}

		if (controller.placeBomb && world.player.alive) {
			if (world.player.placeBombActive) {

				if (world.player.bombs[world.player.bombID - 3] == undefined) {
					let bombX = Math.floor((world.player.x + world.player.width /2) / 64);
					let bombY = Math.floor((world.player.y + world.player.height /2) / 64);
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
						world.player.bombs[world.player.bombID] = new Bomb(bombX,bombY,Date.now(),world.player.power);
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
	}
	
	const render = function() {
		display.clear()
		let now = Date.now()

		let bombDict = {
			"2":grenade,
			"4":bomb,
			"7":c4,
		}

		for (let i in world.items) {
			let item = world.items[i];
			if (item.type == 1) {
				if (world.player.power == 2) {
					display.drawImage(bomb.canvas,item.x * world.tile_size + 14,item.y * world.tile_size + 14);
				} else if (world.player.power == 4) {
					display.drawImage(c4.canvas,item.x * world.tile_size + 14, item.y * world.tile_size + 14);
				}
			}
		}

		for (let i in world.bombs) {
			for (let x in world.bombs[i]) {
				let b = world.bombs[i][x];
				if (!b.detonated) {
					display.drawImage(bombDict[b.power].canvas,b.x * world.tile_size + 14,b.y * world.tile_size + 14) 
				}
			}
		}

		for (let i in world.bombs) {
			for (let x in world.bombs[i]) {
				let b = world.bombs[i][x];
				if (b.detonated) {
					let smoke_opacity = 1 - (now - b.timeStamp - 2600) / 700
					for (let f = b.explosion.up; f <= b.explosion.down; f++) {
						display.drawImage(smoke.canvas, b.x * world.tile_size - 24, f * world.tile_size - 24, smoke_opacity);
						if (now - b.timeStamp < 2750) {
							display.drawImage(fireball.canvas, b.x * world.tile_size - 24, f * world.tile_size - 24);
						}
					}
					for (let u = b.explosion.left; u <= b.explosion.right; u++) {
						if (u != b.x) {
							display.drawImage(smoke.canvas, u * world.tile_size - 24, b.y * world.tile_size - 24, smoke_opacity);
							if (now - b.timeStamp < 2750) {
								display.drawImage(fireball.canvas, u * world.tile_size - 24, b.y * world.tile_size - 24);
							}
						}
					}
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
	socket.emit('update_movement',{x:world.player.x,y:world.player.y,alive:world.player.alive})
	resize();
	engine.start();

	window.addEventListener("keydown", controller.update);
	window.addEventListener("keyup", controller.update);
	window.addEventListener("resize", resize)
});

