'use strict';

var mongoose = require('mongoose');
var Schema =  mongoose.Schema;

//JUST AN EXAMPLE OF HOW IT COULD BE
var MarkerSchema = new Schema({
  name: { type: String, unique: false},
  
});

/**
 * Virtuals
 */

// Public marker information
MarkerSchema
  .virtual('public')
  .get(function() {
    return {
      'name': this.name,
    };
  });


module.exports = mongoose.model('Marker', MarkerSchema);