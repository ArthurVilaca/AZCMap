'use strict';

var app = require('./app');

// Set default node environment to development
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';


// Export the application
module.exports = app.makeServer();
