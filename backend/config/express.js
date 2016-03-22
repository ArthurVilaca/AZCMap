/**
 * Express configuration
 */

'use strict';

var express  = require('express');
var favicon = require('serve-favicon');
var path  = require('path');
var config = require('./environment');
var bodyParser = require('body-parser');
var requestIp = require('request-ip');

module.exports = function(app) {
  app.set('view engine', 'html');
  app.set('appPath', path.join(config.root, 'frontend'));
  
  app.use(favicon(path.join(app.get('appPath'), 'favicon.ico')));
  app.use(bodyParser.json());
  //This middleware will add a 'clientIp' attribute to the request
  app.use(requestIp.mw());
  app.use(express.static(app.get('appPath')));
}
