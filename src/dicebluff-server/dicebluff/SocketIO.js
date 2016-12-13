class SocketIO {

	constructor()
	{
		const server = require('http').createServer();
		const io     = require('socket.io')(server);

		io.on('connection', function(socket) {
			const current_player = addPlayer();

			socket.broadcast.emit('player-join', current_player);
			socket.emit('self-join', current_player);

			console.log(`User joined with id ${current_player.id}`);

			// Listen to click event
			socket.on('player-click', function(data) {
				// Log a message with the position
				console.log(`A user clicked on the location x: ${data.x}, y: ${data.y}`);
				io.sockets.emit('player-click', data);
			});

			// Listen to player update event
			socket.on('player-update', function(data) {
				// Log a message with the position
				socket.broadcast.emit('player-update', data);
			});

			socket.on('disconnect', function() {
				console.log('User disconnected!');
			});
		});

		server.listen(3000);

		this.log("Server started");
	}

	log(log_string)
	{
		console.log(log_string);
	}

}

export {
	SocketIO as default
}
