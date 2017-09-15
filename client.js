#!/usr/bin/env node
var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();


client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    let count = 0;
    console.log('WebSocket Client Connected');

    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        // if (message.type === 'utf8') {
        //     console.log("Received: '" + message.utf8Data + "'");
        // }
        console.log(message);
    });

    // function sendNumber() {
    //     if (connection.connected) {
    //         var number = Math.round(Math.random() * 10);
    //         connection.sendUTF(number.toString());
    //     }
    // }

    // setTimeout(sendNumber, 5000);
});

// client.connect('ws://sv2.lab.biotrump.com/emergency/7/');
client.connect('ws://localhost:8080/');
