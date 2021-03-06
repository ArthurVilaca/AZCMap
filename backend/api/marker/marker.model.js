'use strict';

var mongoose = require('mongoose');

var Schema =  mongoose.Schema;
const markerTypes = {
  'Focus point': 1,
  'Zika case': 2,
  'Dengue case': 3,
  'Chikungunya case': 4
};

var MarkerSchema = new Schema({
  userName: String,
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
  type: { type: Number, default: markerTypes['Focus point'] },
  pictureUrl: String,
  creationDate: { type: Date , default: Date.now},
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
      userName: this.userName,
      address: this.address,
      description: this.description,
      location: this.location,
      type: this.type,
      pictureUrl: this.pictureUrl,
      creationDate: this.creationDate
    };
  });


module.exports = mongoose.model('Marker', MarkerSchema);