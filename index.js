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

})

setInterval(() => {
	io.emit('update_bombs',bombs)
	io.emit('update',players)
}, 8)

