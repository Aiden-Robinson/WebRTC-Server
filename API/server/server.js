const HTTPS_PORT = 8000;
const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

let peerConnection;

function main() {
    const httpsServer = startHttpsServer(serverConfig);
    startWebSocketServer(httpsServer);
    printHelp();
  }

// Yes, TLS is required for WebRTC
const serverConfig = { //Certificates
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
  };



  function startHttpsServer(serverConfig) {
    // Handle incoming requests from the client
    const handleRequest = (request, response) => { //handling request from client
      console.log(`request received: ${request.url}`);
  
      // This server only serves two files: The HTML page and the client JS file
      if(request.url === '/') {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(fs.readFileSync('client/index.html'));
      } else if(request.url === '/webrtc.js') {
        response.writeHead(200, {'Content-Type': 'application/javascript'});
        response.end(fs.readFileSync('client/webrtc.js'));
      }
    };
  
    const httpsServer = https.createServer(serverConfig, handleRequest);
    httpsServer.listen(HTTPS_PORT, '0.0.0.0');
    return httpsServer;
  }




// let createOffer = async () => {
//     peerCOnnection= new RTCPeerConnection(servers) //specify which STUn servers to use in connection

//     let offer = await peerConnection.createOffer()
    
// }

function startWebSocketServer(httpsServer) {
    // Create a server for handling websocket calls
    const wss = new WebSocketServer({server: httpsServer});
  
    wss.on('connection', (ws) => {
      ws.on('message', (message) => {
        // Broadcast any received message to all clients
        console.log(`received: ${message}`);
        wss.broadcast(message);
      });
    });
  
    wss.broadcast = function(data) {
      this.clients.forEach((client) => {
        if(client.readyState === WebSocket.OPEN) {
          client.send(data, {binary: false});
        }
      });
    };
  }

function printHelp() {
    console.log(`Server running. Visit https://localhost:${HTTPS_PORT} in Firefox/Chrome/Safari.\n`);
    console.log('Please note the following:');
    console.log('  * Note the HTTPS in the URL; there is no HTTP -> HTTPS redirect.');
    console.log('  * You\'ll need to accept the invalid TLS certificate as it is self-signed.');
    console.log('  * Some browsers or OSs may not allow the webcam to be used by multiple pages at once. You may need to use two different browsers or machines.');
  }
  
  main();