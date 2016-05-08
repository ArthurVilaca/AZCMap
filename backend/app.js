'use strict';

var express = require('express');
var config = require('./config/environment');
var http = require('http');
var mongoose = require('mongoose');

//Redefines Promise global to bluebird
global.Promise = require('bluebird');

function makeServer() {
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
  // Set the socket io configuratio
  require('./config/socketio')(io);

  require('./config/express')(app);
  require('./routes')(app);

  // config.ip won't be used even in production
  server.listen(config.port, function () {
    console.log('listening on *:%d, in %s mode', config.port, config.env);
  });
  
  return server;
}

//Exports the makeServer function to improve testability
module.exports = makeServer;