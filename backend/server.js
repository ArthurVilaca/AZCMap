'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.use(express.static(__dirname + '/../frontend'));

app.route('/').get(function(req, res){
  res.sendFile('frontend/index.html');
});

app.route('/*').get(function(req, res){
  res.redirect('/');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function (socket) {
	console.log('new connection');
 	
 	socket.on('new user', function (data) {
		console.log(data);
	});

 	socket.on('new marker', function (data) {
		console.log(data);
	});

	socket.emit('markers', {});

  	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});