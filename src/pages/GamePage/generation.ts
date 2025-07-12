const colorSimilarityThreshold = 25;

import { db } from "../../db";
import { booleanSetterType, sleep } from "../../helpers";
import { PRNG } from "../../prng";
import { AppDispatch } from "../../store";
import type { GridLayout, Tile } from "./components/Grid/Grid";
import {
  setGridTransition,
  setOriginalGridLayout,
  setSolvedGridLayout,
  setTileTransition,
} from "./components/Grid/gridSlice";
import { GameState, resetSwaps, resetTimer, setGameState, setSwaps, setTimer } from "./gameSlice";

export async function newLevel(
  dispatch: AppDispatch,
  rows: number,
  columns: number,
  tileTransitionDelay: number,
  fadeGrid: boolean,
  myRng: PRNG,
  setGridLoaded?: booleanSetterType
) {
  dispatch(setGameState(GameState.Generating));
  dispatch(resetSwaps());
  dispatch(resetTimer());

  if (fadeGrid && setGridLoaded) {
    dispatch(setGridTransition("fade-out"));

    await sleep(500);

    setGridLoaded(false);
  }

  const tileList = generateNewTileList(columns, rows, myRng);

  const solvedGrid = {
    rows: rows,
    columns: columns,
    tiles: tileList,
  };

  dispatch(setOriginalGridLayout(solvedGrid));

  dispatch(setSolvedGridLayout(tileList));

  if (fadeGrid && setGridLoaded) {
    await sleep(100);

    dispatch(setGridTransition("fade-in"));
    setGridLoaded(true);

    await sleep(500);
  }

  await sleep(tileTransitionDelay);

  dispatch(setTileTransition("shrink"));

  await sleep(800);

  const randomTileList = randomizeTileList(solvedGrid.tiles, myRng);

  const originalGrid = {
    rows: solvedGrid.rows,
    columns: solvedGrid.columns,
    tiles: randomTileList,
  };

  dispatch(setOriginalGridLayout(originalGrid));

  db.games.put({
    id: 1,
    completed: 0,
    swaps: 0,
    time: 0,
    rows: rows,
    columns: columns,
    currentLayout: originalGrid,
    solvedGrid: solvedGrid.tiles,
  });

  dispatch(setTileTransition("full"));

  await sleep(700);

  dispatch(setTileTransition(""));
  dispatch(setGameState(GameState.Waiting));
}

export async function loadSavedLevel(
  dispatch: AppDispatch,
  swaps: number,
  timer: number,
  currentLayout: GridLayout,
  solvedGrid: Tile[]
) {
  dispatch(setGameState(GameState.Generating));

  dispatch(setSwaps(swaps));
  dispatch(setTimer(timer));
  dispatch(setOriginalGridLayout(currentLayout));
  dispatch(setSolvedGridLayout(solvedGrid));

  await sleep(500);

  dispatch(setGameState(GameState.Waiting));
}

function randomizeTileList(grid: Tile[], myRng: PRNG) {
  var originalGrid = [...grid];
  const randomGrid = [] as Tile[];

  originalGrid = originalGrid.filter((item) => !item.fixed);

  for (let i = 0; i < grid.length; i++) {
    if (grid[i].fixed) {
      randomGrid[i] = grid[i];
    } else {
      let randomIndex = Math.floor(myRng.generate() * originalGrid.length);

      randomGrid[i] = originalGrid[randomIndex];
      originalGrid.splice(randomIndex, 1);
    }
  }

  return randomGrid;
}

function generateNewTileList(gridWidth: number, gridHeight: number, myRng: PRNG): Tile[] {
  const cornerColors = generateCornerColors(myRng);

  let colorGrid = generateGradientGrid(cornerColors, gridWidth, gridHeight);

  let fixedTileNumList = chooseFixedTiles(gridHeight, gridWidth, myRng);

  let tileList: Tile[] = [];

  for (let i = 0; i < gridWidth * gridHeight; i++) {
    tileList.push({
      tileColor: colorGrid[i],
      fixed: fixedTileNumList.includes(i),
    });
  }

  return tileList;
}

function generateCornerColors(myRng: PRNG): Array<string> {
  let suitableColors = false;
  let cornerColors: Array<string> = new Array<string>(4);

  while (!suitableColors) {
    const colorDeltas = [];

    for (let i = 0; i < 4; i++) {
      cornerColors[i] = getRandomColor(myRng);
    }

    for (let i = 0; i < 4; i++) {
      let rgb1 = hexToRgb(cornerColors[i]);
      for (let j = 1 + i; j < 4; j++) {
        let rgb2 = hexToRgb(cornerColors[j]);
        colorDeltas.push(deltaE([rgb1.r, rgb1.g, rgb1.b], [rgb2.r, rgb2.g, rgb2.b]));
      }
    }

    if (Math.min(...colorDeltas) > colorSimilarityThreshold) {
      suitableColors = true;
    }
  }

  return cornerColors;
}

// Generate a random hex code
function getRandomColor(myRng: PRNG): string {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(myRng.generate() * 16)];
  }
  return color;
}

// Function to interpolate between two colors
function interpolateColor(color1: string, color2: string, factor: number): string {
  // Validate input colors
  const isValidColor = (color: string) => /^#[0-9A-Fa-f]{6}$/.test(color);
  if (!isValidColor(color1) || !isValidColor(color2)) {
    throw new Error("Invalid color format. Expected format: #RRGGBB.");
  }

  const components1 = color1.slice(1).match(/.{2}/g) || [];
  const components2 = color2.slice(1).match(/.{2}/g) || [];

  const result = components1.map((hex, i) => {
    const value1 = parseInt(hex, 16);
    const value2 = parseInt(components2[i], 16);
    return Math.round(value1 + factor * (value2 - value1));
  });

  return `#${result.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

// Function to generate the gradient grid
function generateGradientGrid(
  cornerColors: Array<string>,
  width: number,
  height: number
): Array<string> {
  const grid: Array<string> = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Interpolate between the top and bottom edges
      const colorTop = interpolateColor(cornerColors[0], cornerColors[1], x / (width - 1));
      const colorBottom = interpolateColor(cornerColors[2], cornerColors[3], x / (width - 1));
      // Interpolate between the result of the top and bottom
      const color = interpolateColor(colorTop, colorBottom, y / (height - 1));
      grid.push(color);
    }
  }
  return grid;
}

function chooseFixedTiles(rows: number, columns: number, myRng: PRNG) {
  var fixedTileNumList: Array<number> = [0, columns - 1, columns * (rows - 1), rows * columns - 1];

  function genFullVertical(fixedTileNumList: Array<number>, rows: number, columns: number) {
    let column = columns / 2 - 1;
    if (columns & 1) {
      for (let i = 0; i < rows; i++) {
        fixedTileNumList.push(columns * i + Math.ceil(column));
      }
    } else {
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < 2; j++) {
          fixedTileNumList.push(columns * i + (column + j));
        }
      }
    }
  }

  function genFullHorizontal(fixedTileNumList: Array<number>, rows: number, columns: number) {
    let row = rows / 2 - 1;
    if (rows & 1) {
      for (let i = 0; i < columns; i++) {
        fixedTileNumList.push(columns * Math.ceil(row) + i);
      }
    } else {
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < columns; j++) {
          fixedTileNumList.push(columns * (row + i) + j);
        }
      }
    }
  }

  interface sideFunctionsType {
    [key: number]: () => void;
  }

  function genSides(
    fixedTileNumList: Array<number>,
    rows: number,
    columns: number,
    sides: Array<number>
  ) {
    const sideFunctions: sideFunctionsType = {
      0: () => {
        for (let i = 1; i < columns - 1; i++) {
          fixedTileNumList.push(i); // Top
        }
      },
      1: () => {
        for (let i = 1; i < rows - 1; i++) {
          fixedTileNumList.push(i * columns); // Left
        }
      },
      2: () => {
        for (let i = 1; i < columns - 1; i++) {
          fixedTileNumList.push(columns * (rows - 1) + i); // Bottom
        }
      },
      3: () => {
        for (let i = 1; i < rows - 1; i++) {
          fixedTileNumList.push((i + 1) * columns - 1); // Right
        }
      },
    };

    sides.forEach((side) => sideFunctions[side]());
  }

  function getCenterTiles(rows: number, columns: number): Array<number> {
    var centerTiles: Array<number> = [];

    let row = rows / 2;
    let column = columns / 2;
    if ((columns * rows) & 1) {
      centerTiles.push(columns * Math.ceil(row) - Math.ceil(column));
    } else if (!(columns & 1) && !(rows & 1)) {
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          centerTiles.push(columns * (row + i) - (column + j));
        }
      }
    } else {
      if (!(columns & 1)) {
        for (let i = 0; i < 2; i++) {
          centerTiles.push(columns * Math.ceil(row) - (column + i));
        }
      } else {
        for (let i = 0; i < 2; i++) {
          centerTiles.push(columns * (row + i) - Math.ceil(column));
        }
      }
    }

    return centerTiles;
  }

  var fixedTilePatterns = [
    // Random full sides [0]
    (fixedTileNumList: Array<number>, rows: number, columns: number) => {
      let totalPatterns = 15;
      if (rows < 4 && columns < 4) {
        totalPatterns = 14;
      }

      let sidePattern = Math.floor(myRng.generate() * totalPatterns);

      const sidePatterns = [
        [0],
        [1],
        [2],
        [3],
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 2],
        [1, 3],
        [2, 3],
        [0, 1, 2],
        [0, 1, 3],
        [0, 2, 3],
        [1, 2, 3],
        [0, 1, 2, 3],
      ];

      genSides(fixedTileNumList, rows, columns, sidePatterns[sidePattern]);

      return true;
    },
    // Every other square [1]
    (fixedTileNumList: Array<number>, rows: number, columns: number) => {
      if ((columns * rows) & 1 && !(columns == 3 && rows == 3)) {
        for (let i = 2; i < columns * rows - 1; i += 2) {
          if (!fixedTileNumList.includes(i)) {
            fixedTileNumList.push(i);
          }
        }
        return true;
      } else {
        return false;
      }
    },
    // Center [2]
    (fixedTileNumList: Array<number>, rows: number, columns: number) => {
      let centerTiles = getCenterTiles(rows, columns);
      for (let i = 0; i < centerTiles.length; i++) {
        fixedTileNumList.push(centerTiles[i]);
      }
      return true;
    },
    // Vertical line [3]
    (fixedTileNumList: Array<number>, rows: number, columns: number) => {
      genFullVertical(fixedTileNumList, rows, columns);
      return true;
    },
    // Horizontal line [4]
    (fixedTileNumList: Array<number>, rows: number, columns: number) => {
      genFullHorizontal(fixedTileNumList, rows, columns);
      return true;
    },
    // Cross [5]
    (fixedTileNumList: Array<number>, rows: number, columns: number) => {
      if (rows > 6 && columns > 6) {
        genFullVertical(fixedTileNumList, rows, columns);

        let centerTiles = getCenterTiles(rows, columns);
        for (let i = 0; i < centerTiles.length; i++) {
          fixedTileNumList.splice(fixedTileNumList.indexOf(centerTiles[i]), 1);
        }

        genFullHorizontal(fixedTileNumList, rows, columns);
        return true;
      } else {
        return false;
      }
    },
    // X [6]
    (fixedTileNumList: Array<number>, rows: number, columns: number) => {
      if (rows != columns) {
        return false;
      }
      for (let i = 1; i < rows - 1; i++) {
        fixedTileNumList.push((i*rows)+i);
        fixedTileNumList.push(((i+1)*rows)-(i+1));
      }
      return true;
    },
    // Just corners [7]
    () => {
      return true;
    },
  ];

  let pattern = null;

  do {
    pattern = Math.floor(myRng.generate() * fixedTilePatterns.length);
  } while (!fixedTilePatterns[pattern](fixedTileNumList, rows, columns));

  return fixedTileNumList.sort(function (a, b) {
    return a - b;
  });
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : {
        r: 255,
        g: 255,
        b: 255,
      };
}

function deltaE(rgbA: Array<number>, rgbB: Array<number>): number {
  let labA = rgb2lab(rgbA);
  let labB = rgb2lab(rgbB);
  let deltaL = labA[0] - labB[0];
  let deltaA = labA[1] - labB[1];
  let deltaB = labA[2] - labB[2];
  let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
  let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
  let deltaC = c1 - c2;
  let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  let sc = 1.0 + 0.045 * c1;
  let sh = 1.0 + 0.015 * c1;
  let deltaLKlsl = deltaL / 1.0;
  let deltaCkcsc = deltaC / sc;
  let deltaHkhsh = deltaH / sh;
  let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
}

function rgb2lab(rgb: Array<number>) {
  let r = rgb[0] / 255,
    g = rgb[1] / 255,
    b = rgb[2] / 255,
    x,
    y,
    z;
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
