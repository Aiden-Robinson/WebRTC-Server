const HTTPS_PORT = 8000;
const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;
const { RTCPeerConnection, RTCSessionDescription } = require('wrtc');
const { Worker } = require('worker_threads');

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
        if (request.url === '/') {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(fs.readFileSync('client/index.html'));
        } else if (request.url === '/webrtc.js') {
            response.writeHead(200, { 'Content-Type': 'application/javascript' });
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
    const wss = new WebSocketServer({ server: httpsServer });
    let peerConnection;

    // Broadcast function to send messages to all connected clients
    wss.broadcast = function broadcast(data) {
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    };

    // Start the ball worker with the correct path
    const ballWorker = new Worker('./server/ballWorker.js');

    ballWorker.on('message', (frameBuffer) => {
        if (peerConnection) {
            // Send the frame buffer over WebRTC
            // Assuming you have a method to send video frames
            sendVideoFrame(frameBuffer);
        }
    });

    wss.on('connection', (ws) => {
        ws.on('message', (message) => {
            const signal = JSON.parse(message);
            if (signal.sdp) {
                handleSdpOffer(signal.sdp, ws, signal);
                peerConnection = new RTCPeerConnection();
            } else if (signal.type === 'guess') {
                console.log(`Received guess - X: ${signal.x}, Y: ${signal.y}`); // Log the received guess
            } else {
                wss.broadcast(message);
            }
        });
    });

    function sendVideoFrame(frameBuffer) {
        // Convert frameBuffer to a format suitable for WebRTC
        // This is a placeholder; you will need to implement encoding
        const videoFrame = { type: 'video', data: frameBuffer };
        wss.broadcast(JSON.stringify(videoFrame));
    }
}

// New function to handle SDP offers and send random numbers
function handleSdpOffer(sdp, ws, signal) {
    console.log('SDP offer received:', sdp);
    
    // Create a new RTCPeerConnection for the server
    const peerConnection = new RTCPeerConnection();

    // Set the remote description using the received SDP offer
    peerConnection.setRemoteDescription(new RTCSessionDescription(sdp))
        .then(() => {
            // Create an SDP answer
            return peerConnection.createAnswer();
        })
        .then((answer) => {
            // Set the local description with the created answer
            return peerConnection.setLocalDescription(answer);
        })
        .then(() => {
            // Send the SDP answer back to the client
            ws.send(JSON.stringify({ sdp: peerConnection.localDescription, uuid: signal.uuid }));
        })
        .catch(error => {
            console.error('Error handling SDP offer:', error);
        });
}

function printHelp() {
    console.log(`Server running. Visit https://localhost:${HTTPS_PORT} in Firefox/Chrome/Safari.\n`);
    console.log('Please note the following:');
    console.log('  * Note the HTTPS in the URL; there is no HTTP -> HTTPS redirect.');
    console.log('  * You\'ll need to accept the invalid TLS certificate as it is self-signed.');
    console.log('  * Some browsers or OSs may not allow the webcam to be used by multiple pages at once. You may need to use two different browsers or machines.');
  }
  
  main();