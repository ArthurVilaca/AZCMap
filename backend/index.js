'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = require('./app');

// Export the application
module.exports = app();