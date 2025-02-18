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

canvas.addEventListener("touchstart", touchHandler, { passive: false });
canvas.addEventListener("touchmove", touchHandler, { passive: false });
canvas.addEventListener("touchend", touchEndHandler, { passive: false });

function touchHandler(e) {
    e.preventDefault(); // Prevents scrolling and zooming
    let touch = e.touches[0];
    let touchX = touch.clientX - canvas.getBoundingClientRect().left;

    if (touchX > 0 && touchX < canvas.width) {
        paddleX = touchX - paddleWidth / 2;
    }
}

function touchEndHandler(e) {
    e.preventDefault(); // Prevent unintended scrolling
    // Stop paddle movement when touch ends
    rightPressed = false;
    leftPressed = false;
}


function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                // Calculate previous position
                const prevX = x - dx;
                const prevY = y - dy;

                // Check if the ball is inside the brick *now*
                const insideNow = x + ballRadius > b.x && x - ballRadius < b.x + brickWidth &&
                                  y + ballRadius > b.y && y - ballRadius < b.y + brickHeight;
                
                // Check if the ball *wasn't* inside in the last frame
                const insideBefore = prevX + ballRadius > b.x && prevX - ballRadius < b.x + brickWidth &&
                                     prevY + ballRadius > b.y && prevY - ballRadius < b.y + brickHeight;

                if (insideNow && !insideBefore) {  
                    // Ball has moved into the brick → find the primary collision axis
                    const overlapX = Math.min(x + ballRadius - b.x, b.x + brickWidth - (x - ballRadius));
                    const overlapY = Math.min(y + ballRadius - b.y, b.y + brickHeight - (y - ballRadius));

                    if (overlapX < overlapY) {
                        dx = -dx; // Horizontal bounce
                    } else {
                        dy = -dy; // Vertical bounce
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
            // Normalize hit position (-0.5 to 0.5), where -0.5 is the left edge and 0.5 is the right edge
            const hitPoint = (x - paddleX) / paddleWidth - 0.5;
        
            // Base angle adjustment based on hit position
            const maxAngle = Math.PI / 2; // 90 degrees max deviation
            let newAngle = hitPoint * maxAngle;
        
            // Add slight randomness to the angle
            const randomFactor = (Math.random() - 0.5) * (Math.PI / 180); // ±1° variation
            newAngle += randomFactor;
        
            // Ensure total speed stays constant
            //const speed = Math.sqrt(dx * dx + dy * dy);
            const speed = Math.sqrt(18)
            // Convert the angle to new dx, dy
            const angleDx = speed * Math.sin(newAngle);
            const baseDx = dx;
            dx = angleDx;
            // dx = (angleDx * 3 + baseDx) / 4; // Optional: blend with original dx
        
            // Recalculate dy to maintain speed consistency
            dy = -Math.abs(Math.sqrt(speed * speed - dx * dx));

            console.log(dx*dx + dy*dy)
        } else if (y + ballRadius > canvas.height) {
            // Reset ball position with a randomized direction but constant speed
            x = canvas.width / 2;
            y = canvas.height - 50;
            //const speed = 3
            const speed = Math.sqrt(dx * dx + dy * dy);
            const angle = (Math.random() * Math.PI) / 4 + Math.PI / 4; // Random angle between 45° and 75°
    
            dx = (Math.random() > 0.5 ? 1 : -1) * speed * Math.cos(angle);
            dy = -speed * Math.sin(angle); // Ensure upward motion
    
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