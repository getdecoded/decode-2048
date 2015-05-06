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
    return !!tiles[row][col];
}

/**
 * Adds a new tile to the game
 */
function addTile(row, col, value) {
    if (!value) {
        value = Math.random() < 0.25 ? 2 : 4;
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
 * Renders the game!
 */
function renderGame() {
    for (var i = 0; i < tileList.length; i += 1) {
        var tile = tileList[i];

        if (!tile.element) {
            tile.element = document.createElement('div');

            tile.text = document.createElement('span');
            tile.text.className = 'tile-text';
            tile.text.innerHTML = tile.value;
            tile.element.appendChild(tile.text);

            tileContainer.appendChild(tile.element);
        }

        tile.element.className = 'tile pos-' + tile.row + '-' + tile.col;
    }

}

/**
 * Move all of the tiles up (where possible)
 *
 * @param (String) axis - Whether to go along 'col' or 'row'
 * @param (Number) dir - Whether to move up (-1) or down (1)
 */
function push(axis, dir) {
    var start = 0;
    if (dir === 1) {
        start = gridSize - 1;
    }
    for (var row = start; (row >= 0) && (row < gridSize); row -= dir) {
        console.log(row);
        for (var col = start; (col >= 0) && (col < gridSize); col -= dir) {

            if (tileActive(row, col)) {
                console.log('MOVING TILE: ', row, col);
                var newTile;
                if (axis === 'col') {
                    newTile = row;
                } else {
                    newTile = col;
                }
                for (var test = newTile + dir; (test >= 0) && (test < gridSize); test += dir) {
                    console.log(axis, test);
                    if (((axis === 'col') && (tileActive(test, col))) || ((axis === 'row') && (tileActive(row, test)))) {
                        // Collision, check to merge!
                        break;
                    } else {
                        newTile = test;
                    }
                }

                if (axis === 'col') {
                    moveTile(row, col, newTile, col);
                } else {
                    moveTile(row, col, row, newTile);
                }
            }
        }
    }
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
    switch (event.keyCode) {
        case 37: // Left
            push('row', -1);
            break;
        case 38: // Up
            push('col', -1);
            break;
        case 39: // Right
            push('row', 1);
            break;
        case 40: // Down
            push('col', 1);
            break;
    }

    addTileRandom();

    if (canMove()) {
        renderGame();
    } else {
        document.write('Lose');
    }

    event.preventDefault();
}

// Run the game
setupGame();
