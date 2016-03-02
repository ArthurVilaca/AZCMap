/**
 * Socket.io configuration
 */

'use strict';
module.exports = function(io) {
    io.on('connection', function (socket) {
        console.log('new connection');
        
        socket.on('new user', function (data) {
            console.log(data);
        });
        
        require('../api/marker/marker.socket')(socket);
        
        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
    });    
}