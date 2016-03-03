/**
 * Express configuration
 */

'use strict';

var express  = require('express');
var favicon = require('serve-favicon');
var path  = require('path');
var config = require('./environment');

module.exports = function(app) {
  app.set('view engine', 'html');
  app.set('appPath', path.join(config.root, 'frontend'));

  app.use(favicon(path.join(config.root, 'frontend', 'favicon.ico')));
  app.use(express.static(app.get('appPath')));
}
