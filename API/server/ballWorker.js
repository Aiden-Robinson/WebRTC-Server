const { parentPort } = require('worker_threads');
const { createCanvas } = require('canvas');

const canvasWidth = 640;
const canvasHeight = 480;
const ballRadius = 20;
let x = ballRadius;
let y = ballRadius;
let dx = 2; // Change in x (speed)
let dy = 2; // Change in y (speed)
const frameRate = 30; // Configurable frame rate

function generateFrame() {
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Clear the canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw the ball
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.closePath();

    // Update ball position
    x += dx;
    y += dy;

    // Bounce off the walls
    if (x + ballRadius > canvasWidth || x - ballRadius < 0) {
        dx = -dx;
    }
    if (y + ballRadius > canvasHeight || y - ballRadius < 0) {
        dy = -dy;
    }

    // Send the frame to the main thread
    parentPort.postMessage(canvas.toBuffer('image/png'));
}

// Generate frames at the specified frame rate
setInterval(generateFrame, 1000 / frameRate);