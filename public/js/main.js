function randInt(min,max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}
function genColor() {
    let color = "#" + Math.floor((Math.random() * (16777216 - 363636)) + 363636).toString(16);
    if (color.length != 7) {color = color.slice(0, 1) + "0" + color.slice(1, 6); }
    return color;
}
window.addEventListener("load", function() {

	const socket = io();
	const controller = new KeyboardController("w","a","s","d"," ")
//	const controller = new GamePadController();
	const world = new World();
	world.generateMap(25,25);
	world.spawnPlayer();
	const display = new Display(document.querySelector("#canvas"),1280,720,world.map[0].length * world.tile_size,world.map.length * world.tile_size)

	const resize = function() {
		display.resize(window.innerWidth,window.innerHeight,16,9);
	}

	const update = function() {
//		controller.update();
		if (controller.placeBomb) {
			world.player.placeBomb(world.player.x,world.player.y,64)
			console.log(world.player.bombs)
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
		display.drawMap(world.map,world.mapKey,world.tile_size);
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
	})
});

