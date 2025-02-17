const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let ballRadius = 15;
let x = canvas.width / 2;
let y = canvas.height - 50;
let dx = 3;
let dy = -3;

let paddleHeight = 20;
let paddleWidth = 120;
let paddleX = (canvas.width - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;

let paddleVelocity = 0;
const paddleAcceleration = 0.8;
const paddleFriction = 0.95;
const paddleMaxSpeed = 12;

const brickRowCount = 4;
const brickColumnCount = 6;
const brickWidth = 100;
const brickHeight = 30;
const brickPadding = 15;
const brickOffsetTop = 50;
const brickOffsetLeft = 50;

// Candy theme colors
const candyColors = [
    "#FF6B6B",  // Strawberry red
    "#4ECDC4",  // Mint blue
    "#FFD93D",  // Lemon yellow
    "#FF8B94",  // Bubblegum pink
    "#98DFD6"   // Mint green
];

// Initialize bricks with random candy colors
let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { 
            x: 0, 
            y: 0, 
            status: 1, 
            color: candyColors[Math.floor(Math.random() * candyColors.length)]
        };
    }
}

let score = 0;

let momentumEnabled = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

const momentumToggle = document.getElementById("momentumToggle");
const momentumLabel = document.querySelector(".switch-label");
momentumToggle.addEventListener("change", function() {
    momentumEnabled = momentumToggle.checked;
    if (!momentumEnabled) {
        paddleVelocity = 0;
    }
    momentumLabel.textContent = momentumEnabled ? "Paddle Momentum: ON" : "Paddle Momentum: OFF";
});

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                // Check for collision with the brick
                if (x + ballRadius > b.x && x - ballRadius < b.x + brickWidth && y + ballRadius > b.y && y - ballRadius < b.y + brickHeight) {
                    // Determine the side of collision
                    const distX = Math.abs(x - (b.x + brickWidth / 2));
                    const distY = Math.abs(y - (b.y + brickHeight / 2));

                    if (distX > distY) {
                        dx = -dx; // Left or right collision
                    } else {
                        dy = -dy; // Top or bottom collision
                    }
                    b.status = 0;
                    score++;
                }
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    // Create candy swirl effect
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, ballRadius);
    gradient.addColorStop(0, "#FF8B94");    // Inner color
    gradient.addColorStop(1, "#FF6B6B");    // Outer color
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = "#FFF";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    // Create candy cane stripe effect
    const gradient = ctx.createLinearGradient(paddleX, 0, paddleX + paddleWidth, 0);
    gradient.addColorStop(0, "#FF0000");
    gradient.addColorStop(0.25, "#FF0000");
    gradient.addColorStop(0.25, "#FFFFFF");
    gradient.addColorStop(0.5, "#FFFFFF");
    gradient.addColorStop(0.5, "#FF0000");
    gradient.addColorStop(0.75, "#FF0000");
    gradient.addColorStop(0.75, "#FFFFFF");
    gradient.addColorStop(1, "#FFFFFF");
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                // Draw rounded rectangle
                const radius = 10; // Radius for rounded corners
                ctx.moveTo(brickX + radius, brickY);
                ctx.lineTo(brickX + brickWidth - radius, brickY);
                ctx.quadraticCurveTo(brickX + brickWidth, brickY, brickX + brickWidth, brickY + radius);
                ctx.lineTo(brickX + brickWidth, brickY + brickHeight - radius);
                ctx.quadraticCurveTo(brickX + brickWidth, brickY + brickHeight, brickX + brickWidth - radius, brickY + brickHeight);
                ctx.lineTo(brickX + radius, brickY + brickHeight);
                ctx.quadraticCurveTo(brickX, brickY + brickHeight, brickX, brickY + brickHeight - radius);
                ctx.lineTo(brickX, brickY + radius);
                ctx.quadraticCurveTo(brickX, brickY, brickX + radius, brickY);
                ctx.closePath();
                ctx.fillStyle = bricks[c][r].color;
                ctx.fill();
                // Add shine effect
                const gradient = ctx.createLinearGradient(brickX, brickY, brickX, brickY + brickHeight);
                gradient.addColorStop(0, "rgba(255, 255, 255, 0.4)");
                gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }
    }
}

function drawScore() {
    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 20, 30);
}

// Add this function to reset bricks for a new round
function resetBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { 
                x: 0, 
                y: 0, 
                status: 1, 
                color: candyColors[Math.floor(Math.random() * candyColors.length)]
            };
        }
    }
    // Reset ball position but keep the score
    x = canvas.width / 2;
    y = canvas.height - 50;
    dx = Math.abs(dx); // Make sure ball starts moving upward
    dy = -Math.abs(dy);
}

// Add this function to check if all bricks are gone
function checkLevelComplete() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                return false;
            }
        }
    }
    return true;
}

// Update the draw function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    collisionDetection();

    // Check if level is complete
    if (checkLevelComplete()) {
        resetBricks();
    }

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } 
    if (y + ballRadius > canvas.height - paddleHeight) {
        if (x > paddleX - ballRadius && x < paddleX + paddleWidth + ballRadius) {
            dy = -dy;
        } else if (y + ballRadius > canvas.height) {
            // Reset ball position but don't reload the page
            x = canvas.width / 2;
            y = canvas.height - 50;
            dx = Math.abs(dx); // Make sure ball starts moving upward
            dy = -Math.abs(dy);
            paddleX = (canvas.width - paddleWidth) / 2;
        }
    }

    // Update paddle movement based on momentum setting
    if (momentumEnabled) {
        if (rightPressed) {
            paddleVelocity += paddleAcceleration;
        } else if (leftPressed) {
            paddleVelocity -= paddleAcceleration;
        }
        
        // Apply friction
        paddleVelocity *= paddleFriction;
        
        // Limit max speed
        paddleVelocity = Math.max(Math.min(paddleVelocity, paddleMaxSpeed), -paddleMaxSpeed);
        
        // Update paddle position
        paddleX += paddleVelocity;
    } else {
        if (rightPressed) {
            paddleX += 7;
        } else if (leftPressed) {
            paddleX -= 7;
        }
    }
    
    // Wrap paddle around screen (keep this for both modes)
    if (paddleX + paddleWidth < 0) {
        paddleX = canvas.width;
    } else if (paddleX > canvas.width) {
        paddleX = -paddleWidth;
    }

    x += dx;
    y += dy;
    requestAnimationFrame(draw);
}

draw(); 