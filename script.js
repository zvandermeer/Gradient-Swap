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

document.addEventListener('touchmove', onCursorMove);
document.addEventListener('mousemove', onCursorMove);

const grid = document.getElementById('grid');

const generateButton = document.getElementById('generate');
generateButton.addEventListener('click', () => {
    randomize = true;
    puzzleSolved = false;
    randomizeCornerColors();
    generateGrid();
});

const solutionButton = document.getElementById('solution');
solutionButton.addEventListener('click', () => {
    randomize = false;
    puzzleSolved = true;
    generateGrid();
});

function randomizeCornerColors() {
    // Define the four corner colors
    color1 = getRandomColor(); // Top-left (red)
    color2 = getRandomColor(); // Top-right (green)
    color3 = getRandomColor(); // Bottom-left (blue)
    color4 = getRandomColor(); // Bottom-right (yellow)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function onCursorMove(event) {
    cursorX = event.pageX;
    cursorY = event.pageY;
}

function onItemDrag() {
    moveAt(cursorX, cursorY);
}

function moveAt(pageX, pageY) {
    draggedTile.style.left = pageX - draggedTile.offsetWidth / 2 + 'px';
    draggedTile.style.top = pageY - draggedTile.offsetHeight / 2 + 'px';
}

function startDrag(e, touch) {
    if (e.target.classList.contains('tile') && !e.target.classList.contains('placeholder') && !e.target.classList.contains('fixed') && !puzzleSolved) {
        draggedTile = e.target;
        draggedTile.classList.add('dragging');
        moveAt(e.pageX, e.pageY);

        placeholderTile = document.createElement('div');
        placeholderTile.classList.add('tile', 'placeholder');
        placeholderTile.style.backgroundColor = "white";
        grid.insertBefore(placeholderTile, draggedTile.nextSibling)

        if(touch) {
            document.addEventListener('touchmove', onItemDrag);
        } else {
            document.addEventListener('mousemove', onItemDrag);
        }
    }
}

document.body.addEventListener('touchstart', (e) => {startDrag(e, true)});
document.body.addEventListener('mousedown', (e) => {startDrag(e, false)});

async function stopDrag(touch) {
    if (draggedTile) {
        let element = document.elementsFromPoint(cursorX, cursorY)[0];
        if(element.classList.contains('tile') && !element.classList.contains('placeholder')) {
            newTile = element;

            oldTilePos = placeholderTile.getBoundingClientRect();
            newTilePos = newTile.getBoundingClientRect();

            draggedTile.classList.add('swapping');
            draggedTile.style.transform = "translate(" + (newTilePos.left - parseInt(draggedTile.style.left.slice(0, -2))) + "px," + (newTilePos.top - parseInt(draggedTile.style.top.slice(0, -2))) + "px)";

            newTile.classList.add('swapping');
            newTile.style.transform = "translate(" + (oldTilePos.left - newTilePos.left) + "px," + (oldTilePos.top - newTilePos.top) + "px)";
            
            await sleep(180);

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


            var gridChildren = grid.children;
            var totalSquares = gridChildren.length - 1;

            var placeholderOffset = 0;

            winCheck: for(var i = 0; i < gridChildren.length; i++) {
                if(!gridChildren[i].classList.contains('placeholder')) {
                    if(parseInt(gridChildren[i].getAttribute('tile-num')) != i - placeholderOffset) {
                        break winCheck;
                    }
                    if(i == totalSquares) {
                        puzzleSolved = true;
                    }
                } else {
                    placeholderOffset = 1;
                }
            }

        } else {
            oldTilePos = placeholderTile.getBoundingClientRect();

            draggedTile.classList.add('swapping');
            draggedTile.style.transform = "translate(" + (oldTilePos.left - parseInt(draggedTile.style.left.slice(0, -2))) + "px," + (oldTilePos.top - parseInt(draggedTile.style.top.slice(0, -2))) + "px)";

            await sleep(180);

            draggedTile.classList.remove('swapping');
        }

        placeholderTile.remove();
        placeholderTile = null;

        if(touch) {
            document.removeEventListener('touchmove', onItemDrag);
        } else {
            document.removeEventListener('mousemove', onItemDrag);
        }

        draggedTile.classList.remove('dragging');

        draggedTile.style.left = null;
        draggedTile.style.top = null;
        draggedTile.style.transform = null;
        draggedTile = null;
    }
}

document.body.addEventListener('touchend', () => {stopDrag(true)});
document.body.addEventListener('mouseup', () => {stopDrag(false)});

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

function generateGrid() {
    const rows = document.getElementById('rows').value;
    const columns = document.getElementById('columns').value;

    let colorGrid = generateGradientGrid(color1, color2, color3, color4, columns, rows);

    var fixedTileNumList = [];
    fixedTileNumList.push(0);
    fixedTileNumList.push(rows-1);
    fixedTileNumList.push(rows*(columns-1));
    fixedTileNumList.push((rows*columns)-1);

    var randomTileList = [];
    var fixedTileList = [];

    // Clear existing grid
    grid.innerHTML = '';
    
    // Update grid template
    grid.style.gridTemplateColumns = `repeat(${columns}, 100px)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 100px)`;

    let counter = 0;

    // Generate new grid of tiles with random colors
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.style.backgroundColor = colorGrid[i][j];
            tile.draggable = false;
            tile.setAttribute('tile-num', counter)
            if(randomize) {
                if(fixedTileNumList.includes(counter)) {
                    fixedTileList.push(tile);
                } else {
                    randomTileList.push(tile);
                }
            } else {
                grid.appendChild(tile);
            }
            counter++;
        }
    }

    if(randomize) {
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

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Generate initial grid
randomizeCornerColors();
generateGrid();
