/**
 * Express configuration
 */

'use strict';

var express  = require('express');
var favicon = require('serve-favicon');
var path  = require('path');
var config = require('./environment');
var bodyParser = require('body-parser');

module.exports = function(app) {
  app.set('view engine', 'html');
  app.set('appPath', path.join(config.root, 'frontend'));

  app.use(favicon(path.join(config.root, 'frontend', 'favicon.ico')));
  app.use(bodyParser.json());
  app.use(express.static(app.get('appPath')));
}
