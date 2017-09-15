#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var url = require('url');

let setHead = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'};

let myData = JSON.stringify({ 'name': 'clover' });

var server = http.createServer((request, response) => {
    console.log((new Date()) + ' Received request for ' + request.url);

    //  check pathname
    let pathname = url.parse(request.url).pathname;

    /* if(!CheckPathname(pathname)) {
      response.write("404 Not found");
      response.writeHead(404, {"Content-Type": "text/plan"});
      resonse.end();
    } */

    request.setEncoding('utf8');

    response.write('Hello World!');
    response.writeHead(404);
    response.end(myData);
});

server.listen(8080, () => {
    console.log((new Date()) + ' Server is listening on port 8080');
});

function CheckPathname(path) {
  if(path != '/ps') {
    return false;
  } else {
    return true;
  }
}

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', (request) => {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' +
        request.origin + ' rejected.');
      return;
    }

    // if (request.resource !== '/ps') {
    //   request.reject();
    //   return;
    // }


    var connection = request.accept('echo-protocol', request.origin);

    console.log((new Date()) + ' Connection accepted.');

    console.log(request.resource);

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }

        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });

    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        // clearInterval(sendMSG);
    });

    // continuousely send msg
    let sendMSG = setInterval( () => {
      connection.sendUTF('{"name": "clover"}');
      console.log('{"name": "clover"}');
    }, 3000);
});
