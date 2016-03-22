/**
 * Thing model events
 */

'use strict';

const EventEmitter =  require('events');
var Marker = require('./marker.model');
var MarkerEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
MarkerEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

//Custom events
const MARKER_ALL_EVENT = 'marker:all';

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Marker.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    MarkerEvents.emit(event, doc);
  }
}

MarkerEvents.emitAllMarkers = function (client) {
  Marker.find()
    .then((markers) => {
      client.emit(MARKER_ALL_EVENT, { event: MARKER_ALL_EVENT, data: markers });
    })
    .catch((error) => {
      client.emit(MARKER_ALL_EVENT, { event: MARKER_ALL_EVENT, error });
    });
};

module.exports = MarkerEvents;
