/**
 * Socket.io configuration
 */

'use strict';
module.exports = function(io) {
    io.on('connection', function (client) {
        console.log('new connection');
        
        client.on('new user', function (data) {
            console.log(data);
        });
        
        require('../api/marker/marker.socket').register(client);
        
        client.on('disconnect', function(){
            console.log('user disconnected');
        });
    });    
}