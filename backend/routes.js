/**
 * Main application routes
 */

'use strict';
var path = require('path');

module.exports = function (app) {
  // Insert routes below
  //auth routes, if used
  //app.use('/api/users', require('./api/user'));
  //app.use('/auth', require('./auth'));
  
  //The marker endpoint
  app.use('/api/marker', require('./api/marker'));

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
};
