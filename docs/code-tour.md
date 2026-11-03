Spooky Tetris lil code tour

- index.html codes the canvas and music
- tetris.js contains the js code for the game
- assets holds the animated background, sounds and appearances of the tetrominoes

When the game is loaded:
1. init() starts the game and loads necessary stuff
2. The grid is a 10×20 table that notes down where blocks have landed using hitboxes
3. The falling block uses gravity, movePieceDown(), to move it down one row
4. The left, right, and down arrow keys move the block
5. Before any sideways move, checkCollision() makes sure the block is inside valid boundaries
6. Bats also appear
