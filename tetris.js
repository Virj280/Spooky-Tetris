const canvas = document.getElementById('tetrisbackground');
const ctx = canvas.getContext('2d');
const CELL_SIZE = 5;

window.addEventListener('keydown', (e) => {
    if (!currentPiece) return;

    if (e.key === 'ArrowLeft') {
        currentPiece.move('left');
    }
    if (e.key === 'ArrowRight') {
        currentPiece.move('right');
    }
    if (e.key === 'ArrowDown'){
        dropPiece();
    }
});

function dropPiece() {
    const scale = 0.4;
    const boardHeight = sprite.height * scale;
    const boardY = (canvas.height - boardHeight) / 2;

    currentPiece.y = boardY + boardHeight - currentPiece.height - 20;
}

let cutscene=1;
        // the cutscene variable is for when skinny bat or fat bat spawns, so that blocks don't spawn while you watch the bats fall to the ground. when skinny bat or fat bat dies cutscene gets set back to 0 so blocks can continue spawning. however no functionality exists for this variable yet.
let blockSprite;
let gridX = 4; // Initial column position;
let gridY = 0; // Initial row position (top of board);
//current piece

let currentPiece;
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
            video.play(); // Explicitly kick off playback
            resolve(video);
        };
        video.onerror = () => reject(new Error(`Failed to load video: ${src}`));
    });
}

// Store bats
const bats = [];

// Global variables to hold our preloaded images
let background, sprite, batSprite;

function drawTetris() {
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
    if (sprite) {
        const scale = 0.4;
        const width = sprite.width * scale;
        const height = sprite.height * scale;

        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2;

        ctx.drawImage(sprite, x, y, width, height);
    }

    // Load & draw bats 
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
    if (blockSprite && sprite) {
    const scale = 0.4;
    const boardWidth = sprite.width * scale;
    const boardHeight = sprite.height * scale;

    // Calculate top-left pixel corner of board
    const boardX = (canvas.width - boardWidth) / 2;
    const boardY = (canvas.height - boardHeight) / 2;

    // Convert grid units to pixel offset on canvas
    const pixelX = boardX + (gridX * CELL_SIZE);
    const pixelY = boardY + (gridY * CELL_SIZE);

    // Render 2x2 block (width and height cover 2 grid cells)
    ctx.drawImage(
        blockSprite, 
        pixelX, 
        pixelY, 
        CELL_SIZE * 2, 
        CELL_SIZE * 2
    );
}
  //draws current piece.
currentPiece.update()

}
//Inspired by w3 schools game tutorial
//Can hold a shape of a rectangle that will fall via move function
function gameObject(width, height, color, x, y, type) {
    this.width = width;
    this.height = height;
    this.type = type;
    this.x = x;
    this.y = y;

    this.update = function() {
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    this.move = function(pos) {
        var step = 20;
        if (pos === "left" && this.x - step >= 174) {
            this.x -= step;
        } else if (pos === "right" && this.x + this.width + step <= canvas.width - 174) {
            this.x += step;
        } else if (pos === "up") {
            this.y -= step;
        } else if (pos === "down") {
            this.y += step;
        }
    }
}

    
function movePieceDown(){
    frame++;

    const scale = 0.4;
    const boardHeight = sprite.height * scale;
    const boardY = (canvas.height - boardHeight) / 2;
    const bottomY = boardY + boardHeight - currentPiece.height - 20;

    if (frame % 2 == 0 && currentPiece.y < bottomY) {
        currentPiece.move("down");

        if (currentPiece.y > bottomY) {
            currentPiece.y = bottomY;
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
    sound.currentTime = 0;
    sound.play();
}


// Spawn bats randomly
function spawnBat() {
    const size = 40;

    const x = Math.random() * (canvas.width - size);
    const y = canvas.height-150;

    bats.push({ x, y });
    
    // Draw the game (this may be shocking but to PLAY the game, you need to SEE it)
    drawTetris();
}

// Load bg and board first
async function init() {
    try {
        // Preload all assets once so they don't block drawing loops
        [background, sprite, batSprite] = await Promise.all([
            loadVideo("assets/bg-animated-embed.mp4"),
            loadImage("assets/tetris-board.png"),
            loadImage("assets/skinny-bat.png"),
            loadImage("assets/tetrominoe-1.png"),
        ]);
        currentPiece = new gameObject(30, 30, "red", canvas.width/2, 120);
        // Start continuous animation loop so the video updates live
        animationLoop();
        frame = 0;
        setInterval(movePieceDown,1000);

        // Spawn a bat every 2 seconds
        setInterval(spawnBat, 2000);
        setInterval(soundcall, 5000);

    } catch (error) {
        console.error("cant load bg or ui:", error);
    }
    setInterval(() => {
    if (cutscene === 0) { // checks cutscene state before moving blocks
        gridY++}}, 500)
}

init();
