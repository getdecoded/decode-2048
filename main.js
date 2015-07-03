var tiles = [];
var tileList = [];
var gridSize = 4;
var tileContainer = document.getElementById('tile-container');
var scoreContainer = document.getElementById('score-counter');
var score = 0;

/**
 * Sets up the game for the first time
 */
function setupGame() {
    document.addEventListener('keydown', handleKey);
    startGame();
}

/**
 * Starts game by creating arrays and adding first tiles
 */
function startGame() {
    tiles = [];
    tileList = [];
    score = 0;

    for (var row = 0; row < gridSize; row += 1) {
        tiles.push([]);

        for (var col = 0; col < gridSize; col += 1) {
            tiles[row][col] = null;
        }
    }

    addTileRandom();
    addTileRandom();

    renderGame();
}

/**
 * Determine if a tile is occupied
 *
 * @param {Number} row
 * @param {Number} col
 * @returns {Boolean} If there is a tile at this location
 */
function tileActive(row, col) {
    try {
        return !!tiles[row][col];
    } catch (e) {
        throw new Error('Could not find tile at ' + row + ', ' + col);
    }
}

/**
 * Adds a new tile to the game
 *
 * @param {Number} row
 * @param {Number} col
 * @param {Number} [value] - The value to assign to the tile
 */
function addTile(row, col, value) {
    if (!value) {
        value = Math.random() < 0.25 ? 4 : 2;
    }

    var tile = {
        value: value,
        row: row,
        col: col
    };

    tiles[row][col] = tile;

    tileList.push(tile);
}

/**
 * Adds a tile to the game in a random place
 */
function addTileRandom() {
    var col, row;
    do {
        col = Math.floor(Math.random() * gridSize);
        row = Math.floor(Math.random() * gridSize);
    } while (tileActive(row, col));

    addTile(row, col);
}

/**
 * Move a tile somewhere
 *
 * @param {Number} row
 * @param {Number} col
 * @param {Number} newRow
 * @param {Number} newCol
 */
function moveTile(row, col, newRow, newCol) {
    var tile = tiles[row][col];
    tiles[row][col] = null;
    tile.row = newRow;
    tile.col = newCol;

    tiles[newRow][newCol] = tile;
}

/**
 * Combine two tiles into one
 *
 * @param {Number} row
 * @param {Number} col
 * @param {Number} intoRow
 * @param {Number} intoCol
 */
function combineTile(row, col, intoRow, intoCol) {
    var oldTile = tiles[row][col];
    var newTile = tiles[intoRow][intoCol];

    newTile.value += oldTile.value;
    newTile.hasMerged = true;
    oldTile.dead = true;
    oldTile.row = intoRow;
    oldTile.col = intoCol;

    score += newTile.value;

    removeTile(row, col);
}

/**
 * Remove a tile from the board
 *
 * @param {Number} row
 * @param {Number} col
 */
function removeTile(row, col) {
    var tile = tiles[row][col];

    tile.dead = true;
    tiles[row][col] = null;
}

/**
 * Renders the game!
 */
function renderGame() {
    var remove = [];
    var tile;
    var i;

    for (i = 0; i < tileList.length; i += 1) {
        updateTile(i);

        tile = tileList[i];

        if (tile.dead) {
            remove.push(tile);
        }
    }

    scoreContainer.innerHTML = score;

    for (i = 0; i < remove.length; i += 1) {
        tile = remove[i];

        tileList.splice(tileList.indexOf(tile), 1);
    }

    setTimeout(function() {
        for (var i = 0; i < remove.length; i += 1) {
            var tile = remove[i];

            if (tile.element) {
                tileContainer.removeChild(tile.element);
            }
        }
    }, 200);
}

/**
 * Updates and renders a single tile
 *
 * @param {Number} index
 */
function updateTile(index) {
    var tile = tileList[index];

    if (!tile.element) {
        tile.element = document.createElement('div');

        tile.text = document.createElement('span');
        tile.text.className = 'tile-text';
        tile.element.appendChild(tile.text);

        tileContainer.appendChild(tile.element);
    }

    tile.text.innerHTML = tile.value;
    tile.element.className = 'tile pos-' + tile.row + '-' + tile.col + ' tile-' + tile.value;
    tile.hasMerged = false;

    if (tile.dead) {
        tile.element.className += ' dead';
    }
}

/**
 * Move a single tile if possible
 *
 * @param {Number} row
 * @param {Number} col
 * @param {String} axis - Whether to go along 'col' or 'row'
 * @param {Number} dir - Whether to move up (-1) or down (1)
 * @returns {Boolean} Whether the tile moved or not
 */
function push(row, col, axis, dir) {
    // If we're moving along a column, we're changing the row
    // If we're moving across a row, we're changing the column
    var throughAxis = axis === 'row' ? 'col' : 'row';
    var newPos = { row: row, col: col };
    var startPos = newPos[throughAxis];
    var currentTile = tiles[row][col];

    for (var testPos = startPos + dir; (testPos >= 0) && (testPos < gridSize); testPos += dir) {
        newPos[throughAxis] = testPos;

        if (tileActive(newPos.row, newPos.col)) {
            var checkTile = tiles[newPos.row][newPos.col];

            if ((checkTile.value === currentTile.value) && (!checkTile.hasMerged)) {
                combineTile(row, col, checkTile.row, checkTile.col);

                // End the function here
                return true;
            }

            // Backtrack to the previous tile
            newPos[throughAxis] = testPos - dir;

            break;
        }
    }

    moveTile(row, col, newPos.row, newPos.col);

    // Return whether the tile has moved or not
    return (startPos !== newPos);
}

/**
 * Move all of the tiles (where possible)
 *
 * @param (String) axis - Whether to go along 'col' or 'row'
 * @param (Number) dir - Whether to move up (-1) or down (1)
 * @returns {Boolean} Whether anything moved or not
 */
function pushAll(axis, dir) {
    var start = 0;
    var moved = false;

    if (dir === 1) {
        start = gridSize - 1;
    }

    for (var row = start; (row >= 0) && (row < gridSize); row -= dir) {
        for (var col = start; (col >= 0) && (col < gridSize); col -= dir) {
            if (tileActive(row, col)) {
                if (push(row, col, axis, dir)) {
                    moved = true;
                }
            }
        }
    }

    return moved;
}

/**
 * Check if the player can move
 */
function canMove() {
    for (var row = 0; row < gridSize; row += 1) {
        for (var col = 0; col < gridSize; col += 1) {
            if (!tileActive(row, col)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Handle the keypresses
 *
 * @param {Object} event
 */
function handleKey(event) {
    var moved = false;

    switch (event.keyCode) {
        case 37: // Left
        case 38: // Up
        case 39: // Right
        case 40: // Down
            event.preventDefault();
            break;
    }

    switch (event.keyCode) {
        case 37: // Left
            moved = pushAll('row', -1);
            break;
        case 38: // Up
            moved = pushAll('col', -1);
            break;
        case 39: // Right
            moved = pushAll('row', 1);
            break;
        case 40: // Down
            moved = pushAll('col', 1);
            break;
    }

    if (moved) {
        addTileRandom();
        renderGame();
        if (!canMove()) {
            lose();
        }
    }
}

/**
 * Handle losing
 */
function lose() {
    for (var i = 0; i < tileList.length; i += 1) {
        if (tileList[i].element) {
            tileContainer.removeChild(tileList[i].element);
        }
    }

    startGame();
}

// Run the game
setupGame();
