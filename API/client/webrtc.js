let peerConnection;
let localStream;



const peerConnectionConfig = { //STUN servers from Google
  'iceServers': [
    {'urls': 'stun:stun.stunprotocol.org:3478'},
    {'urls': 'stun:stun.l.google.com:19302'},
  ]
};

  async function pageReady() {
    uuid = createUUID();
  
    serverConnection = new WebSocket(`wss://${window.location.hostname}:8000`);
    serverConnection.onmessage = gotMessageFromServer;
    serverConnection.onopen = () => {
        console.log('WebSocket connection established'); // Log when the connection is opened
    };
  
    serverConnection.onerror = (error) => {
        console.error('WebSocket error:', error); // Log WebSocket errors
    };
  }

  function start(isCaller) { //responsible for initializing a webRTC connection
    peerConnection = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.onicecandidate = gotIceCandidate; //event handler when ICE framework finds a new candidate for the connection
    peerConnection.ontrack = gotRemoteStream; //event handler when remote media stream is received
  
    if (localStream){
      for(const track of localStream.getTracks()) {// retreives media tracks from localStram
      peerConnection.addTrack(track, localStream);
      }
    }
 
  
    if(isCaller) {
      peerConnection.createOffer().then(createdDescription).catch(errorHandler);
    }
  }

  function gotMessageFromServer(message) {
    console.log('Message received from server:', message.data);
    if (!peerConnection) start(false);

    const signal = JSON.parse(message.data);

    // Ignore messages from ourselves
    if (signal.uuid == uuid) return;

    if (signal.sdp) {
        console.log('SDP answer received:', signal.sdp); // Log the received SDP answer
        peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
            // Only create answers in response to offers
            if (signal.sdp.type !== 'offer') return;
  
            peerConnection.createAnswer().then(createdDescription).catch(errorHandler);
        }).catch(errorHandler);
    } else if (signal.ice) {
        peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
    } else if (signal.type === 'video') {
        // Handle incoming video frame
        const frameBuffer = new Uint8Array(Object.values(signal.data)); // Convert to Uint8Array
        const blob = new Blob([frameBuffer], { type: 'image/png' }); // Create a Blob from the frame buffer
        const img = new Image();
        img.src = URL.createObjectURL(blob); // Create a URL for the Blob
        img.onload = () => {
            const canvas = document.getElementById('video-canvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before drawing
            ctx.drawImage(img, 0, 0); // Draw the image on the canvas
            URL.revokeObjectURL(img.src); // Clean up the URL
        };
    }
  }

  function gotIceCandidate(event) { //verifies and sends ICE candidates to the singalling server 
    if (event.candidate) {
      console.log('Sending ICE candidate:', event.candidate); // Log the ICE candidate
      serverConnection.send(JSON.stringify({ ice: event.candidate, uuid: uuid }));
    }
  }

  function gotRemoteStream(event) { //aknowledges when media stream has been succsesfully received 
    console.log('got remote stream');
    //remoteVideo.srcObject = event.streams[0];
  }


  function createdDescription(description) {//handles local description in a WebRTC application
    console.log('got description');
  
    peerConnection.setLocalDescription(description).then(() => {
      serverConnection.send(JSON.stringify({'sdp': peerConnection.localDescription, 'uuid': uuid}));
    }).catch(errorHandler);
  }

  function errorHandler(error) {
    console.log(error);
  }
  

  // Taken from http://stackoverflow.com/a/105074/515584
// Strictly speaking, it's not a real UUID, but it gets the job done here
function createUUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
}