var tiles = [];
var tileList = [];
var gridSize = 4;
var tileContainer = document.getElementById('tile-container');

/**
 * Sets up the game by creating arrays and adding first tiles
 */
function setupGame() {
    for (var row = 0; row < gridSize; row += 1) {
        tiles.push([]);

        for (var col = 0; col < gridSize; col += 1) {
            tiles[row][col] = null;
        }
    }

    addTileRandom();
    addTileRandom();
    console.log('??');
    document.addEventListener('keydown', handleKey);

    renderGame();
}

/**
 * Determine if a tile is occupied
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
 */
function combineTile(row, col, intoRow, intoCol) {
    var oldTile = tiles[row][col];
    var newTile = tiles[intoRow][intoCol];

    newTile.value += oldTile.value;
    newTile.hasMerged = true;
    oldTile.dead = true;
    oldTile.row = intoRow;
    oldTile.col = intoCol;

    removeTile(row, col);
}

/**
 * Remove a tile from the board
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
    for (var i = 0; i < tileList.length; i += 1) {
        var tile = tileList[i];
        if (tile.dead) {
            remove.push(tile);
        }


        if (!tile.element) {
            tile.element = document.createElement('div');

            tile.text = document.createElement('span');
            tile.text.className = 'tile-text';
            tile.element.appendChild(tile.text);

            tileContainer.appendChild(tile.element);
        }

        tile.text.innerHTML = tile.value;
        tile.element.className = 'tile pos-' + tile.row + '-' + tile.col + ' tile-' + tile.value;
        if (tile.dead) {
            tile.element.className += ' dead';
        }

        tile.hasMerged = false;
    }

    for (var i = 0; i < remove.length; i += 1) {
        var tile = remove[i];


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
 * Move all of the tiles up (where possible)
 *
 * @param (String) axis - Whether to go along 'col' or 'row'
 * @param (Number) dir - Whether to move up (-1) or down (1)
 */
function push(axis, dir) {
    var start = 0;
    var moved = false;
    if (dir === 1) {
        start = gridSize - 1;
    }
    for (var row = start; (row >= 0) && (row < gridSize); row -= dir) {
        console.log(row);
        for (var col = start; (col >= 0) && (col < gridSize); col -= dir) {

            if (tileActive(row, col)) {
                var currentTile = tiles[row][col];
                var newTile;
                var startTile;
                var merged = false;

                if (axis === 'col') {
                    newTile = row;
                } else {
                    newTile = col;
                }

                startTile = newTile;

                for (var test = newTile + dir; (test >= 0) && (test < gridSize); test += dir) {
                    if (((axis === 'col') && (tileActive(test, col))) || ((axis === 'row') && (tileActive(row, test)))) {
                        var checkTile;
                        if (axis === 'col') {
                            checkTile = tiles[test][col];
                        } else {
                            checkTile = tiles[row][test];
                        }

                        console.log(checkTile.value, currentTile.value);

                        if ((checkTile.value === currentTile.value) && (!checkTile.hasMerged)) {
                            merged = true;
                            combineTile(row, col, checkTile.row, checkTile.col);
                        }

                        break;
                    } else {
                        newTile = test;
                    }
                }

                if (!merged) {
                    if (axis === 'col') {
                        moveTile(row, col, newTile, col);
                    } else {
                        moveTile(row, col, row, newTile);
                    }

                    if (startTile !== newTile) {
                        moved = true;
                    }
                } else {
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
 */
function handleKey(event) {
    var moved = false;
    switch (event.keyCode) {
        case 37: // Left
            moved = push('row', -1);
            break;
        case 38: // Up
            moved = push('col', -1);
            break;
        case 39: // Right
            moved = push('row', 1);
            break;
        case 40: // Down
            moved = push('col', 1);
            break;
    }

    if (moved) {
        addTileRandom();

        if (canMove()) {
            renderGame();
        } else {
            document.write('Lose');
        }
    }


    switch (event.keyCode) {
        case 37: // Left
        case 38: // Up
        case 39: // Right
        case 40: // Down
            event.preventDefault();
            break;
    }
}

// Run the game
setupGame();
