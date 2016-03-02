/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var MarkerEvents = require('./marker.events');

// Model events to emit
var events = ['save', 'remove'];

 function register(socket) {
  // Bind model events to socket events
  for (var i = 0, eventsLength = events.length; i < eventsLength; i++) {
    var event = events[i];
    var listener = createListener('marker:' + event, socket);

    MarkerEvents.on(event, listener);
    socket.on('disconnect', removeListener(event, listener));
  }
}


function createListener(event, socket) {
  return function(doc) {
    console.log("added a marker");
    socket.emit(event, doc);
  };
}

function removeListener(event, listener) {
  return function() {
   console.log("removeu");
    MarkerEvents.removeListener(event, listener);
  };
}

module.exports = register;