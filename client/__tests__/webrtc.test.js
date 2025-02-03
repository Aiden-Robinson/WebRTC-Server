// Mock global browser APIs
global.RTCPeerConnection = jest.fn().mockImplementation(() => ({
  setRemoteDescription: jest.fn().mockResolvedValue(undefined),
  createAnswer: jest.fn().mockResolvedValue('mock-answer'),
  addIceCandidate: jest.fn().mockResolvedValue(undefined),
}));

global.RTCSessionDescription = jest.fn();
global.RTCIceCandidate = jest.fn();
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

describe('gotMessageFromServer', () => {
  let mockCanvas;
  let mockContext;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock canvas and context
    mockContext = {
      clearRect: jest.fn(),
      drawImage: jest.fn(),
    };
    mockCanvas = {
      getContext: jest.fn().mockReturnValue(mockContext),
    };

    // Mock document methods
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === 'video-canvas') return mockCanvas;
      if (id === 'connection-status') return { innerText: '' };
      return null;
    });

    // Mock global variables that would be defined in webrtc.js
    global.peerConnection = new RTCPeerConnection();
    global.uuid = 'local-uuid';
    global.start = jest.fn();
  });

  test('should handle SDP offer message', async () => {
    const message = {
      data: JSON.stringify({
        sdp: { type: 'offer' },
        uuid: 'remote-uuid'
      })
    };

    await gotMessageFromServer(message);

    expect(peerConnection.setRemoteDescription).toHaveBeenCalled();
    expect(peerConnection.createAnswer).toHaveBeenCalled();
  });

  test('should handle SDP answer message', async () => {
    const message = {
      data: JSON.stringify({
        sdp: { type: 'answer' },
        uuid: 'remote-uuid'
      })
    };

    await gotMessageFromServer(message);

    expect(peerConnection.setRemoteDescription).toHaveBeenCalled();
    expect(peerConnection.createAnswer).not.toHaveBeenCalled();
  });

  test('should handle ICE candidate message', async () => {
    const message = {
      data: JSON.stringify({
        ice: { candidate: 'mock-candidate' },
        uuid: 'remote-uuid'
      })
    };

    await gotMessageFromServer(message);

    expect(peerConnection.addIceCandidate).toHaveBeenCalled();
  });

  test('should handle video frame message', () => {
    const message = {
      data: JSON.stringify({
        type: 'video',
        data: [1, 2, 3], // Sample frame data
        uuid: 'remote-uuid'
      })
    };

    gotMessageFromServer(message);

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
  });

  test('should handle error message', () => {
    const message = {
      data: JSON.stringify({
        type: 'error',
        error: '10',
        uuid: 'remote-uuid'
      })
    };

    gotMessageFromServer(message);

    const statusElement = document.getElementById('connection-status');
    expect(statusElement.innerText).toBe('Error: 10 units away from the actual position.');
  });

  test('should ignore messages from self', () => {
    const message = {
      data: JSON.stringify({
        type: 'any-type',
        uuid: 'local-uuid' // Same as global uuid
      })
    };

    gotMessageFromServer(message);

    expect(peerConnection.setRemoteDescription).not.toHaveBeenCalled();
    expect(peerConnection.createAnswer).not.toHaveBeenCalled();
    expect(peerConnection.addIceCandidate).not.toHaveBeenCalled();
  });

  test('should handle invalid JSON message', () => {
    const message = {
      data: 'invalid-json'
    };

    expect(() => gotMessageFromServer(message)).toThrow();
  });
}); 