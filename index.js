console.log("starting")

const express = require('express');
const app = express();
const server = app.listen(8000);
const io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));

let players = {};
let bombs = {};
io.on('connection', function (socket) {
	
	players[socket.id] = {
		x: 0,
		y: 0,
		alive: false,
	}
	bombs[socket.id] = {

	}

	socket.broadcast.emit('update', players)

	socket.on('disconnect', function () {
		delete players[socket.id]
		delete bombs[socket.id]
		io.emit('update', players)
	});

	socket.on('update_movement', function(data) {
		players[socket.id] = data;
	});

	socket.on('add_bomb', function(data) {
		bombs[socket.id][data.id] = data.bomb;
	});
	socket.on('detonate_bomb', function(data) {
		if (bombs[data.socket_id] == undefined || bombs[data.socket_id][data.id] == undefined) return;
			bombs[data.socket_id][data.id].detonated = true;
			let b = bombs[data.socket_id][data.id];
			if (b.crateRight == undefined && data.crateRight != undefined) {
				bombs[data.socket_id][data.id].crateRight = data.crateRight;
				io.emit('destroy_crate', {
					x:data.crateRight.x,
					y:data.crateRight.y
				});
			}
			if (b.crateLeft == undefined && data.crateLeft != undefined) {
				bombs[data.socket_id][data.id].crateLeft = data.crateLeft;
				io.emit('destroy_crate', {
					x:data.crateLeft.x,
					y:data.crateLeft.y
				});
			}
			if (b.crateUp == undefined && data.crateUp != undefined) {
				bombs[data.socket_id][data.id].crateUp = data.crateUp;
				io.emit('destroy_crate', {
					x:data.crateUp.x,
					y:data.crateUp.y
				});
			}
			if (b.crateDown == undefined && data.crateDown != undefined) {
				bombs[data.socket_id][data.id].crateDown = data.crateDown;
				io.emit('destroy_crate', {
					x:data.crateDown.x,
					y:data.crateDown.y
				});
			}
		
	});
	socket.on('remove_bomb', function(data) {
		if (bombs[data.socket_id] == undefined || bombs[data.socket_id][data.id] == undefined) return;
		delete bombs[data.socket_id][data.id]
	});

})

setInterval(() => {
	io.emit('update_bombs',bombs)
	io.emit('update',players)
}, 8)

