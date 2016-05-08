'use strict';

var path = require('path');

// Development specific configuration
// ==================================
module.exports = {

  // MongoDB connection options
  mongo: {
    uri: process.env.DEV_MONGO_URI || 'mongodb://localhost/azc-map'
  },
  
  //Root directory of the app
  root: path.normalize(__dirname + '/../../../'),
};
