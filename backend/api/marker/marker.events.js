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

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Marker.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    MarkerEvents.emit(event, doc);
  };
}

module.exports = MarkerEvents;
