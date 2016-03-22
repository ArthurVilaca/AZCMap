/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var MarkerEvents = require('./marker.events');

// Model events to emit
var events = ['save', 'remove'];

//client: the client that was connected
 function register(client) {
  //TODO: upon connecting, emit a marker:all event so the client can get all the markers 
  MarkerEvents.emitAllMarkers(client);
  // Bind model events to socket events
  for (var i = 0, eventsLength = events.length; i < eventsLength; i++) {
    var event = events[i];
    var listener = createListener('marker:' + event, client);

    MarkerEvents.on(event, listener);
    client.on('disconnect', removeListener(event, listener));
  }
}


function createListener(event, client) {
  return function(doc) {
    console.log(event);
    client.emit(event, { event, data: doc });
  };
}

function removeListener(event, listener) {
  return function() {
    MarkerEvents.removeListener(event, listener);
  };
}

exports.register = register;