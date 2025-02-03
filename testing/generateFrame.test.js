const { parentPort } = require('worker_threads');
const { createCanvas } = require('canvas');
const { generateFrame } = require('../server/ballWorker'); // Adjust the path as necessary

jest.mock('worker_threads', () => ({
    parentPort: {
        postMessage: jest.fn(),
    },
}));

jest.mock('canvas', () => ({
    createCanvas: jest.fn(() => ({
        getContext: jest.fn(() => ({
            clearRect: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            closePath: jest.fn(),
        })),
        toBuffer: jest.fn(() => Buffer.from('fake-image-data')),
    })),
}));

describe('generateFrame', () => {
    beforeEach(() => {
        // Reset mocks before each test
        parentPort.postMessage.mockClear();
    });

    test('should generate a frame and send it to the parent port', () => {
        // Call the function
        generateFrame();

        // Check that the canvas was created
        expect(createCanvas).toHaveBeenCalledWith(640, 480);

        // Check that the frame was sent to the parent port
        expect(parentPort.postMessage).toHaveBeenCalledWith({
            frame: expect.any(Buffer),
            coordinates: expect.objectContaining({
                x: expect.any(Number), // Check if x is a number
                y: expect.any(Number), // Check if y is a number
            }),
        });
    });
}); 