'use strict';

process.env.NODE_ENV = 'development';
process.env.DEV_MONGO_URI = 'mongodb://localhost/azc-map-test';

const request = require('supertest');
const app = require('../app.js');

describe('Marker api endpoint', () => {
  var server;
  
  beforeEach(() => {
    server = app();
  });
  afterEach(done => {
    server.close(done);
  });
  
  it('Request to api/marker/all should return all markers', done => {
    request(server)
      .get('/api/marker/all')
      .expect(200)
      .expect({data: []})
      .end(done);
  });
  
});