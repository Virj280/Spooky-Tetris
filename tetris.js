const canvas = document.getElementById('tetrisbackground');
const ctx = canvas ? canvas.getContext('2d') : null;

const audio = document.getElementById('sound');
if (audio) {
    audio.loop = true;
}

document.addEventListener("keydown", function(event) {
    if (event.key === "p" && audio) {
        audio.play().catch(e => console.log(e));
    }
});

let cutscene = 0;
        // the cutscene variable is for when skinny bat or fat bat spawns, so that blocks don't spawn while you watch the bats fall to the ground. when skinny bat or fat bat dies cutscene gets set back to 0 so blocks can continue spawning. however no functionality exists for this variable yet.
let blockSprite;
let gridX = 4; // Initial column position;
let gridY = 0; // Initial row position (top of board);
//current piece

let currentPiece = null;
//frame is to move the piece one block ish at a time
let frame;

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load: ${src}`));

        img.src = src;
    });
}

//render background
function loadVideo(src) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        
        video.src = src;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.style.display = 'none';

        video.oncanplaythrough = () => {
            video.play().catch(e => console.log(e)); // Explicitly kick off playback
            resolve(video);
        };
        video.onerror = () => reject(new Error(`Failed to load video: ${src}`));
    });
}

// Store bats
const bats = [];

// Global variables to hold our preloaded images
let background, sprite, batSprite;

// Grid configuration
const COLS = 10;
const ROWS = 20;

// ADJUSTABLE SIZING & MOVEMENT:
const STEP_SIZE = 26;          // Distance in pixels moved per grid step
const BLOCK_RENDER_SIZE = 54;  // Visual pixel size of the block sprite

const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// Collision Detection
function checkCollision(piece, offsetX, offsetY) {
    const newX = piece.x + offsetX;
    const newY = piece.y + offsetY;

    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c]) {
                const targetX = newX + c;
                const targetY = newY + r;

                if (targetX < 0 || targetX >= COLS || targetY >= ROWS) {
                    return true;
                }
                if (targetY >= 0 && grid[targetY][targetX] !== 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Lock Piece into Grid
function lockPiece() {
    for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c]) {
                const boardY = currentPiece.y + r;
                const boardX = currentPiece.x + c;
                if (boardY >= 0) {
                    grid[boardY][boardX] = currentPiece.color;
                }
            }
        }
    }
    spawnNewPiece();
}

// Spawn New Block
function spawnNewPiece() {
    currentPiece = {
        x: 4,
        y: 0,
        color: "red",
        shape: [
            [1]
        ]
    };
}

// Move Piece Down by 1 grid space
function movePieceDown() {
    if (!currentPiece) return;
    if (cutscene === 1) return; // checks cutscene state before moving blocks

    if (!checkCollision(currentPiece, 0, 1)) {
        currentPiece.y++;
    } else {
        lockPiece();
    }
}

// Controls
window.addEventListener('keydown', (e) => {
    if (!currentPiece) return;

    if (e.key === 'ArrowLeft') {
        if (!checkCollision(currentPiece, -1, 0)) {
            currentPiece.x--;
        }
    }
    if (e.key === 'ArrowRight') {
        if (!checkCollision(currentPiece, 1, 0)) {
            currentPiece.x++;
        }
    }
    if (e.key === 'ArrowDown') {
        movePieceDown();
    }
});

function drawTetris() {
    if (!ctx || !canvas) return;

    // Clear + redraw bg
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (background) {
        ctx.drawImage(
            background,
            0, 0,
            canvas.width,
            canvas.height
        );
    }

    // Draw board
    let boardX = 0, boardY = 0, boardWidth = 0, boardHeight = 0;
    if (sprite) {
        const scale = 0.4;
        boardWidth = sprite.width * scale;
        boardHeight = sprite.height * scale;

        boardX = (canvas.width - boardWidth) / 2;
        boardY = (canvas.height - boardHeight) / 2;

        ctx.drawImage(sprite, boardX, boardY, boardWidth, boardHeight);
    }

    // Calculate Grid Start Position
    const totalGridWidth = COLS * STEP_SIZE;
    const totalGridHeight = ROWS * STEP_SIZE;
    const gridStartX = boardX + (boardWidth - totalGridWidth) / 2;
    const gridStartY = boardY + (boardHeight - totalGridHeight) / 2 + 5;

    // Center offset to align render size relative to cell step size
    const offset = (STEP_SIZE - BLOCK_RENDER_SIZE) / 2;

    // Draw Locked Grid Blocks
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c] !== 0) {
                const px = gridStartX + (c * STEP_SIZE) + offset;
                const py = gridStartY + (r * STEP_SIZE) + offset;
                if (blockSprite) {
                    ctx.drawImage(blockSprite, px, py, BLOCK_RENDER_SIZE, BLOCK_RENDER_SIZE);
                } else {
                    ctx.fillStyle = grid[r][c];
                    ctx.fillRect(px, py, BLOCK_RENDER_SIZE, BLOCK_RENDER_SIZE);
                    ctx.strokeStyle = '#fff';
                    ctx.strokeRect(px, py, BLOCK_RENDER_SIZE, BLOCK_RENDER_SIZE);
                }
            }
        }
    }

    // Draw Falling Piece
    if (currentPiece) {
        for (let r = 0; r < currentPiece.shape.length; r++) {
            for (let c = 0; c < currentPiece.shape[r].length; c++) {
                if (currentPiece.shape[r][c]) {
                    const px = gridStartX + ((currentPiece.x + c) * STEP_SIZE) + offset;
                    const py = gridStartY + ((currentPiece.y + r) * STEP_SIZE) + offset;
                    
                    if (blockSprite) {
                        ctx.drawImage(blockSprite, px, py, BLOCK_RENDER_SIZE, BLOCK_RENDER_SIZE);
                    } else {
                        ctx.fillStyle = currentPiece.color;
                        ctx.fillRect(px, py, BLOCK_RENDER_SIZE, BLOCK_RENDER_SIZE);
                        ctx.strokeStyle = '#fff';
                        ctx.strokeRect(px, py, BLOCK_RENDER_SIZE, BLOCK_RENDER_SIZE);
                    }
                }
            }
        }
    }

    // Load and draw bats
    if (bats.length > 0 && batSprite) {
        for (const bat of bats) {
            ctx.drawImage(
                batSprite,
                bat.x,
                bat.y,
                40,
                40
            );
        }
    }
}

// loop bg
function animationLoop() {
    drawTetris();
    requestAnimationFrame(animationLoop);
}

//just keeps playing you lost
const sound = document.getElementById("soundtest");
function soundcall(){
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log(e));
    }
}

// Spawn bats randomly
function spawnBat() {
    if (!canvas) return;
    const size = 40;

    const x = Math.random() * (canvas.width - size);
    const y = canvas.height - 150;

    bats.push({ x, y });
    
    // Draw the game (this may be shocking but to PLAY the game, you need to SEE it)
    drawTetris();
}

// Load bg and board first
async function init() {
    try {
        // Preload all assets once so they don't block drawing loops
        [background, sprite, batSprite, blockSprite] = await Promise.all([
            loadVideo("assets/bg-animated-embed.mp4"),
            loadImage("assets/tetris-board.png"),
            loadImage("assets/skinny-bat.png"),
            loadImage("assets/tetrominoe-1.png"),
        ]);

        spawnNewPiece();

        // Start continuous animation loop so the video updates live
        animationLoop();
        frame = 0;
        setInterval(movePieceDown, 1000);

        // Spawn a bat every 2 seconds
        setInterval(spawnBat, 2000);
        setInterval(soundcall, 5000);

    } catch (error) {
        console.error("cant load bg or ui:", error);
    }
    
    setInterval(() => {
        if (cutscene === 0) { // checks cutscene state before moving blocks
            gridY++;
        }
    }, 500);
}

init();
