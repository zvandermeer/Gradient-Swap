let draggedTile = null;
let placeholderTile = null;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function onMouseMove(event) {
    moveAt(event.pageX, event.pageY);
}

function moveAt(pageX, pageY) {
    draggedTile.style.left = pageX - draggedTile.offsetWidth / 2 + 'px';
    draggedTile.style.top = pageY - draggedTile.offsetHeight / 2 + 'px';
}

document.body.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('tile') && !e.target.classList.contains('placeholder')) {
        draggedTile = e.target;
        draggedTile.classList.add('dragging');
        moveAt(e.pageX, e.pageY);

        placeholderTile = document.createElement('div');
        placeholderTile.classList.add('tile', 'placeholder');
        placeholderTile.style.backgroundColor = "white";
        grid.insertBefore(placeholderTile, draggedTile.nextSibling)

        document.addEventListener('mousemove', onMouseMove);
    }
});

document.body.addEventListener('mouseup', async (e) => {
    if (draggedTile) {
        if(e.target.classList.contains('tile') && !e.target.classList.contains('placeholder')) {
            newTile = e.target;

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
        } else {
            oldTilePos = placeholderTile.getBoundingClientRect();

            draggedTile.classList.add('swapping');
            draggedTile.style.transform = "translate(" + (oldTilePos.left - parseInt(draggedTile.style.left.slice(0, -2))) + "px," + (oldTilePos.top - parseInt(draggedTile.style.top.slice(0, -2))) + "px)";

            await sleep(180);

            draggedTile.classList.remove('swapping');
        }

        placeholderTile.remove();
        placeholderTile = null;

        document.removeEventListener('mousemove', onMouseMove);

        draggedTile.classList.remove('dragging');

        draggedTile.style.left = null;
        draggedTile.style.top = null;
        draggedTile.style.transform = null;
        draggedTile = null;
    }
});

const grid = document.getElementById('grid');
const generateButton = document.getElementById('generate');

generateButton.addEventListener('click', generateGrid);

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

// Define the four corner colors
const color1 = "#ff0000"; // Top-left (red)
const color2 = "#00ff00"; // Top-right (green)
const color3 = "#0000ff"; // Bottom-left (blue)
const color4 = "#ffff00"; // Bottom-right (yellow)

function generateGrid() {
    const rows = document.getElementById('rows').value;
    const columns = document.getElementById('columns').value;

    colorGrid = generateGradientGrid(color1, color2, color3, color4, rows, columns);

    // Clear existing grid
    grid.innerHTML = '';
    
    // Update grid template
    grid.style.gridTemplateColumns = `repeat(${columns}, 100px)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 100px)`;

    // Generate new grid of tiles with random colors
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.style.backgroundColor = colorGrid[i][j];
            // tile.style.position = "fixed";
            tile.draggable = false;
            grid.appendChild(tile);
        }
    }

    addDragAndDropListeners();
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
generateGrid();
