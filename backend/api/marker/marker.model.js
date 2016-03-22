'use strict';

var mongoose = require('mongoose');
var Schema =  mongoose.Schema;

var MarkerSchema = new Schema({
  name: String,
  description: String,
  location: {
    type: { type: String },
    coordinates: Array
  },
  address: { // Address information to avoid additional queries
    street: String,
    number: Number,
    zipCode: String,
    neighbourhood: String,
    city: String,
    state: String,
    country: String
  },
  type: { type: String, default: 'water' },
  pictureUrl: String,
  creationDate: { type: Date },
  creatorIp: String,
  creatorLocation: {
    type: { type: String },
    coordinates: Array 
  }
});

/**
 * Virtuals
 */

// Public marker information
MarkerSchema
  .virtual('public')
  .get(function() {
    return {
      _id: this._id,
      name: this.name,
      description: this.description,
      location: this.location,
      type: this.type,
      pictureUrl: this.pictureUrl,
      creationDate: this.creationDate
    };
  });


module.exports = mongoose.model('Marker', MarkerSchema);