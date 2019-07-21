console.log("starting")

const express = require('express');
const app = express();
const server = app.listen(8000);
const io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));

let players = 0;

io.on('connection', function (socket) {
	players++;
	io.emit('serve', { msg: "Current Number of Players : " + players });
	socket.on('disconnect', function() {
		players--;
		io.emit('serve', { msg: "Current Number of Players : " + players });
	})
});

