const canvas = document.getElementById('tetrisbackground');
const ctx = canvas.getContext('2d');
const CELL_SIZE = 5;

const audio = document.getElementById('sound');

audio.loop = true;

document.addEventListener("keydown", function(event) {
    if (event.key === "p") {
        audio.play();
    }
});

let cutscene=1;
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

// Grid configuration
const COLS = 10;
const ROWS = 20;
const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// Collision Detection
function checkCollision(piece, offsetX, offsetY) {
    const newX = piece.x + offsetX;
    const newY = piece.y + offsetY;

    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c]) {
                const targetX = newX + c;
