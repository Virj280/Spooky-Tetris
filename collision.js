const canvas = document.getElementById('tetrisbackground');
const ctx = canvas.getContext('2d');

// Grid configuration
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 25; // Block pixel size
const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

let currentPiece = null;

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
            [1, 1],
            [1, 1]
        ]
    };
}

// Move Piece Down
function movePieceDown() {
    if (!currentPiece) return;

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

// Render Loop
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const boardX = (canvas.width - COLS * BLOCK_SIZE) / 2;
    const boardY = (canvas.height - ROWS * BLOCK_SIZE) / 2;

    // Draw Locked Grid Blocks
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c] !== 0) {
                ctx.fillStyle = grid[r][c];
                ctx.fillRect(boardX + c * BLOCK_SIZE, boardY + r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#fff';
                ctx.strokeRect(boardX + c * BLOCK_SIZE, boardY + r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }

    // Draw Falling Piece
    if (currentPiece) {
        ctx.fillStyle = currentPiece.color;
        for (let r = 0; r < currentPiece.shape.length; r++) {
            for (let c = 0; c < currentPiece.shape[r].length; c++) {
                if (currentPiece.shape[r][c]) {
                    const px = boardX + (currentPiece.x + c) * BLOCK_SIZE;
                    const py = boardY + (currentPiece.y + r) * BLOCK_SIZE;
                    ctx.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
                    ctx.strokeStyle = '#fff';
                    ctx.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }
    }

    requestAnimationFrame(draw);
}

// Start Game
spawnNewPiece();
setInterval(movePieceDown, 500);
draw();
