var WebSockeServer = require('websocket').server;
var http = require('http');

// create http server
var server = http.createServer((request, response) => {
    console.log((new Date()) + ' Recived request for ' + request.url)
    response.writeHead(404)
    response.end();
})

server.listen(8080, () => {
    console.log((new Date()) + ` Server is listening on port 8080`);
})

wsServer = new WebSockeServer({
    httpServer: server,
    autoAcceptConnections: false,
})

function originIsAllowed(origin) {
    return true;
}

wsServer.on('request', (request) => {
    console.log(`------ ${request.remoteAddress} ------`);
    if (!originIsAllowed(request.origin)) {
        request.rejet();
        console.log((new Date()) + ` Connection from origin ${request.origin} rejected.`);
        return;
    }

    var connection = request.accept('', request.origin);
    console.log(new Date() + 'Connection Accepted.');
    connection.on('message', (message) => {
        if(message.type == 'utf8') {
            console.log(`Recived Message: ${message.utf8Data}`);
            connection.sendUTF(message.utf8Data);
        }  else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });

    connection.on('close', (reasonCode, description) => {
        console.log((new Date()) + `Peer ${connection.remoteAddress} disconnected.`)
        clearInterval(sendMSG);
    })

    // continuousely send msg
    let sendMSG = setInterval( () => {
      let ranNum = Math.floor(Math.random()*1000 + 1);
      connection.sendUTF(`{"name": ${ranNum}}`);
      console.log(`{"name": ${ranNum}}`);
    }, 1000);
})
