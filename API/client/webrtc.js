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

  function gotMessageFromServer(message) { //handles incoming messages from a websocket server
    if(!peerConnection) start(false);
  
    const signal = JSON.parse(message.data); //signal stores incoming messages from the server
  
    // Ignore messages from ourself
    if(signal.uuid == uuid) return;
  
    if(signal.sdp) {
      peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
        // Only create answers in response to offers
        if(signal.sdp.type !== 'offer') return;
  
        peerConnection.createAnswer().then(createdDescription).catch(errorHandler);
      }).catch(errorHandler);
    } else if(signal.ice) {
      peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
    }
  }

  function gotIceCandidate(event) { //verifies and sends ICE candidates to the singalling server 
    if(event.candidate != null) {
      serverConnection.send(JSON.stringify({'ice': event.candidate, 'uuid': uuid}));
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