'use strict';

var express = require('express');
var config = require('./config/environment');
var http = require('http');
var mongoose = require('mongoose');

function makeServer() {
  //Use node's default Promise with then and catch as the mongoose promise system
  mongoose.Promise = global.Promise;
  // Connect to MongoDB
  mongoose.connect(config.mongo.uri, config.mongo.options);
  mongoose.connection.on('error', function (err) {
    console.error('MongoDB connection error: ' + err);
    process.exit(-1);
  });

  var app = express();
  var server = http.Server(app);
  var io = require('socket.io')(server);
  //set the socket io configuratio
  require('./config/socketio')(io);

  require('./config/express')(app);
  require('./routes')(app);

  //config.ip won't be used in production
  server.listen(config.port, function () {
    console.log('listening on *:%d, in %s mode', config.port, config.env);
  });
  
  return server;
}

//Exports the makeServer function to improve testability
module.exports = makeServer;