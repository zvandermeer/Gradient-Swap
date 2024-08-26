let draggedTile = null;
let placeholderTile = null;

let randomize = true;
let puzzleSolved = false;

let color1 = null;
let color2 = null;
let color3 = null;
let color4 = null;

let cursorX = null;
let cursorY = null;

// Add listeners to report constant cursor position
document.addEventListener('touchmove', onCursorMove);
document.addEventListener('mousemove', onCursorMove);

// Pull existing elements from HTML
const grid = document.getElementById('grid');

// Generate button should create a new fully randomized grid
const generateButton = document.getElementById('generate');
generateButton.addEventListener('click', () => {
    randomize = true;
    puzzleSolved = false;
    randomizeCornerColors();
    generateGrid();
});

// Solve button should recreate the current grid without randomization
const solutionButton = document.getElementById('solution');
solutionButton.addEventListener('click', () => {
    randomize = false;
    // puzzleSolved = true;
    generateGrid();
});

// Helper sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper clamp function
function clamp(num, lower, upper) {
    return Math.min(Math.max(num, lower), upper);
}

// Reports the position of the cursor every time it moves
function onCursorMove(event) {
    cursorX = event.pageX;
    cursorY = event.pageY;
}

// Moves an item to the proper cursor position when dragged
function onItemDrag() {
    moveAt(cursorX, cursorY);
}

function moveAt(pageX, pageY) {
    draggedTile.style.left = pageX - draggedTile.offsetWidth / 2 + 'px';
    draggedTile.style.top = pageY - draggedTile.offsetHeight / 2 + 'px';
}

// Adds listeners to start dragging when tile is selected
document.body.addEventListener('touchstart', (e) => {
    if (placeholderTile) {
        cancelDrag(true);
    }
    if(e.touches.length === 1){
        startDrag(e, true);
    }
});
document.body.addEventListener('mousedown', (e) => {startDrag(e, false);});

// Starts dragging the selected tile
function startDrag(e, touch) {
    // Ensures the tile should be dragged
    if (e.target.classList.contains('tile') && !e.target.classList.contains('placeholder') && !e.target.classList.contains('fixed') && !puzzleSolved) {
        draggedTile = e.target;
        draggedTile.classList.add('dragging');
        moveAt(e.pageX, e.pageY);

        // Inserts placeholder tile where tile was dragged from
        placeholderTile = document.createElement('div');
        placeholderTile.classList.add('tile', 'placeholder');
        placeholderTile.style.backgroundColor = "white";
        grid.insertBefore(placeholderTile, draggedTile.nextSibling)

        // Adds listener to move the tile with the cursor
        if(touch) {
            document.addEventListener('touchmove', onItemDrag);
        } else {
            document.addEventListener('mousemove', onItemDrag);
        }
    }
}

// Inserts listeners to stop dragging when tile is released
document.body.addEventListener('touchend', () => {stopDrag(true)});
document.body.addEventListener('mouseup', () => {stopDrag(false)});

// Stops dragging the selected tile
async function stopDrag(touch) {
    // Ensures a tile is being dragged
    if (draggedTile) {
        // Gets the nearest tile to swap with
        let element = document.elementsFromPoint(cursorX, cursorY)[0];
        if(element.classList.contains('tile') && !element.classList.contains('placeholder')) {
            newTile = element;

            // Gets coordinates of tiles to swap
            let oldTilePos = placeholderTile.getBoundingClientRect();
            let newTilePos = newTile.getBoundingClientRect();

            // Animates dragged tile into new position
            draggedTile.classList.add('swapping');
            draggedTile.style.transform = "translate(" + (newTilePos.left - parseInt(draggedTile.style.left.slice(0, -2))) + "px," + (newTilePos.top - parseInt(draggedTile.style.top.slice(0, -2))) + "px)";

            // Animates swapped tile to the dragged tile's old position
            newTile.classList.add('swapping');
            newTile.style.transform = "translate(" + (oldTilePos.left - newTilePos.left) + "px," + (oldTilePos.top - newTilePos.top) + "px)";
            
            // Waits for the animation to finish
            await sleep(180);

            // Swaps actual tile element positions after animation is finished
            draggedTile.classList.remove('swapping');
            newTile.classList.remove('swapping');

            const temp = document.createElement('div');
            
            grid.insertBefore(temp, draggedTile);

            grid.replaceChild(draggedTile, newTile);
            grid.replaceChild(newTile, temp);

            temp.remove();

            newTile.style.left = null;
            newTile.style.top = null;
            newTile.style.transform = null;

            placeholderTile.remove();
            placeholderTile = null;

            // Finalizes the dragged tile back to a stationary position
            draggedTile.classList.remove('dragging');

            draggedTile.style.left = null;
            draggedTile.style.top = null;
            draggedTile.style.transform = null;
            draggedTile = null;

            // Evaluates if player has solved the puzzle
            var gridChildren = grid.children;
            var totalSquares = gridChildren.length - 1;

            // If each tile in the grid is in ascending order, then the player wins
            winCheck: for(var i = 0; i < gridChildren.length; i++) {
                if(parseInt(gridChildren[i].getAttribute('tile-num')) != i) {
                    break winCheck;
                }
                if(i === totalSquares) {
                    puzzleSolved = true;
                    console.log("You win!");
                }
            }

        } else {
            // If the dragged tile is not released on top of another tile, snap it back to the home position
            let oldTilePos = placeholderTile.getBoundingClientRect();

            draggedTile.classList.add('swapping');
            draggedTile.style.transform = "translate(" + (oldTilePos.left - parseInt(draggedTile.style.left.slice(0, -2))) + "px," + (oldTilePos.top - parseInt(draggedTile.style.top.slice(0, -2))) + "px)";

            await sleep(180);

            draggedTile.classList.remove('swapping');

            placeholderTile.remove();
            placeholderTile = null;

            // Finalizes the dragged tile back to a stationary position
            draggedTile.classList.remove('dragging');

            draggedTile.style.left = null;
            draggedTile.style.top = null;
            draggedTile.style.transform = null;
            draggedTile = null;
        }

        // Removes listener moving tile with cursor
        if(touch) {
            document.removeEventListener('touchmove', onItemDrag);
        } else {
            document.removeEventListener('mousemove', onItemDrag);
        }
    }
}

// If the tile drag needs to be cancelled for whatever reason
async function cancelDrag(touch) {
    let oldTilePos = placeholderTile.getBoundingClientRect();

    draggedTile.classList.add('swapping');
    draggedTile.style.transform = "translate(" + (oldTilePos.left - parseInt(draggedTile.style.left.slice(0, -2))) + "px," + (oldTilePos.top - parseInt(draggedTile.style.top.slice(0, -2))) + "px)";

    await sleep(180);

    draggedTile.classList.remove('swapping');

    placeholderTile.remove();
    placeholderTile = null;

    // Removes listener moving tile with cursor
    if(touch) {
        document.removeEventListener('touchmove', onItemDrag);
    } else {
        document.removeEventListener('mousemove', onItemDrag);
    }

    // Finalizes the dragged tile back to a stationary position
    draggedTile.classList.remove('dragging');

    draggedTile.style.left = null;
    draggedTile.style.top = null;
    draggedTile.style.transform = null;
    draggedTile = null;
}

// Selects random colors for the corners which will be used to generate the gradient
function randomizeCornerColors() {
    // Define the four corner colors
    color1 = getRandomColor();
    color2 = getRandomColor();
    color3 = getRandomColor();
    color4 = getRandomColor();
}

// Generate a random hex code
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Function to interpolate between two colors
function interpolateColor(color1, color2, factor) {
    const result = color1.slice(1).match(/.{2}/g).map((hex, i) => {
        return Math.round(parseInt(hex, 16) + factor * (parseInt(color2.slice(1).match(/.{2}/g)[i], 16) - parseInt(hex, 16)));
    });
    return `#${result.map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

// Function to generate the gradient grid
function generateGradientGrid(c1, c2, c3, c4, width, height) {
    const grid = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            // Interpolate between the top and bottom edges
            const colorTop = interpolateColor(c1, c2, x / (width - 1));
            const colorBottom = interpolateColor(c3, c4, x / (width - 1));
            // Interpolate between the result of the top and bottom
            const color = interpolateColor(colorTop, colorBottom, y / (height - 1));
            row.push(color);
        }
        grid.push(row);
    }
    return grid;
}

// Generate a new tile grid
function generateGrid() {
    const rows = document.getElementById('rows').value;
    const columns = document.getElementById('columns').value;

    // Generate gradient colors for grid
    let colorGrid = generateGradientGrid(color1, color2, color3, color4, columns, rows);

    // Create fixed tile pattern, setting corners as fixed TODO: Add more fixed tile patterns
    var fixedTileNumList = [];
    fixedTileNumList.push(0);
    fixedTileNumList.push(columns-1);
    fixedTileNumList.push(columns*(rows-1));
    fixedTileNumList.push((rows*columns)-1);

    // Initialize lists of random and fixed tiles
    var randomTileList = [];
    var fixedTileList = [];

    // Clear existing grid
    grid.innerHTML = '';

    const gridPos = grid.getBoundingClientRect();

    const availableScreenWidth = window.innerWidth - 40;
    const availableScreenHeight = window.innerHeight - (gridPos.top + 20);

    const tileWidth = clamp((availableScreenWidth / columns), 0, 100);
    const tileHeight = clamp((availableScreenHeight / rows), 0, 100);
    
    // Update grid template
    grid.style.gridTemplateColumns = `repeat(${columns}, ${tileWidth}px)`;
    grid.style.gridTemplateRows = `repeat(${rows}, ${tileHeight}px)`;

    let counter = 0;

    // Generate new grid of tiles
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            // Create new tile
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.style.backgroundColor = colorGrid[i][j];
            tile.style.width = tileWidth + 'px';
            tile.style.height = tileHeight + 'px';
            tile.draggable = false;
            tile.setAttribute('tile-num', counter)

            // If tile is fixed, add additional properties
            if(fixedTileNumList.includes(counter)) {
                tile.classList.add('fixed');
                 
                const centerDot = document.createElement('div');
                centerDot.classList.add('dot');
                const dotSize = (((tileWidth / 10) + (tileHeight / 10)) / 2);
                centerDot.style.width = dotSize + 'px';
                centerDot.style.height = dotSize + 'px';
                centerDot.style.transform = "translate(" + ((tileWidth-dotSize)/2) + "px," + ((tileHeight-dotSize)/2) + "px)";

                tile.appendChild(centerDot);
            }

            // If the tiles are being randomized, separate fixed and unfixed tiles
            if(randomize) {
                if(tile.classList.contains('fixed')) {
                    fixedTileList.push(tile);
                } else {
                    randomTileList.push(tile);
                }
            } else {
                // If not randomizing, insert the tiles in gradient (created) order
                grid.appendChild(tile);
            }
            counter++;
        }
    }

    if(randomize) {
        // For each tile, if that tile should be fixed, insert the applicable tile. Otherwise grab a random tile
        // from the remaining uninserted tiles
        for (let i = 0; i < counter; i++) {
            if (fixedTileNumList.includes(i)) {
                grid.appendChild(fixedTileList[fixedTileNumList.indexOf(i)]);
            } else {
                let randomIndex = Math.floor(Math.random() * randomTileList.length);
                grid.appendChild(randomTileList[randomIndex]);
                randomTileList.splice(randomIndex, 1);
            }
        }
    }
}

// Generate initial grid
randomizeCornerColors();
generateGrid();
