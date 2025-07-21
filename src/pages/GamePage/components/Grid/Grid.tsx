import { useAppDispatch, useAppSelector } from "../../../../hooks";
import { clamp, sleep } from "../../../../helpers";
import { useEffect, useRef, useState } from "react";
import { Swapy } from "swapy";
import { createSwapy } from "swapy";
import "./grid.css";
import JSConfetti from "js-confetti";
import { GameState, incrementSwaps, setGameState } from "../../gameSlice";
import { AppDispatch } from "../../../../store";
import { setIncorrectTiles } from "./gridSlice";
import { db } from "../../../../db";

export type GridLayout = {
  rows: number;
  columns: number;
  tiles: Tile[];
};

export type Tile = {
  tileColor: string;
  fixed: boolean;
};

const jsConfetti = new JSConfetti();

interface Props {
  setOverlayVisible: (state: boolean) => void;
  gridLoaded: boolean;
  gridRef: React.RefObject<HTMLDivElement | null>;
}

function evaluateGrid(
  dispatch: AppDispatch,
  solvedGridLayout: Tile[],
  internalGridLayout: string[]
): boolean {
  const incorrectTiles = [];

  for (let i = 0; i < solvedGridLayout.length; i++) {
    if (!solvedGridLayout[i].fixed && solvedGridLayout[i].tileColor !== internalGridLayout[i]) {
      incorrectTiles.push(i);
    }
  }

  if (incorrectTiles.length > 0) {
    dispatch(setIncorrectTiles(incorrectTiles));
    return false;
  }

  return true;
}

function saveGrid(
  rows: number,
  columns: number,
  solvedGridLayout: Tile[],
  internalGridLayout: string[]
) {
  const currentLayout = { columns: columns, rows: rows, tiles: [] } as GridLayout;

  for (let i = 0; i < solvedGridLayout.length; i++) {
    if (solvedGridLayout[i].fixed) {
      currentLayout.tiles.push(solvedGridLayout[i]);
    } else {
      currentLayout.tiles.push({ fixed: false, tileColor: internalGridLayout[i] } as Tile);
    }
  }

  db.games.update(1, { currentLayout: currentLayout });
}

function Grid({ setOverlayVisible, gridLoaded, gridRef }: Props) {
  const dispatch = useAppDispatch();

  const gameState = useAppSelector((state) => state.game.value.gameState);

  const gridTransition = useAppSelector((state) => state.grid.value.gridTransition);
  const tileTransition = useAppSelector((state) => state.grid.value.tileTransition);
  const originalLayout = useAppSelector((state) => state.grid.value.originalLayout);
  const solvedGrid = useAppSelector((state) => state.grid.value.solvedGrid);
  const tileHints = useAppSelector((state) => state.grid.value.visibleHints);

  const [availableScreenWidth, setAvailableScreenWidth] = useState(window.innerWidth - 40);
  const [availableScreenHeight, setAvailableScreenHeight] = useState(window.innerHeight - 120);

  const tileWidth = clamp(availableScreenWidth / originalLayout.columns, 0, 100);
  const tileHeight = clamp(availableScreenHeight / originalLayout.rows, 0, 100);

  const dotSize = (tileWidth / 10 + tileHeight / 10) / 2;

  const swapyRef = useRef<Swapy | null>(null);

  useEffect(() => {
    if (gridRef.current) {
      swapyRef.current = createSwapy(gridRef.current, {
        swapMode: "drop",
        animationDuration: 180,
      });
      swapyRef.current.onBeforeSwap(() => {
        // This is for dynamically enabling and disabling swapping.
        // Return true to allow swapping, and return false to prevent swapping.
        return gameState === GameState.Playing || gameState === GameState.Waiting;
      });
      swapyRef.current.onSwap(() => {
        dispatch(incrementSwaps());
      });
      swapyRef.current.onSwapEnd(async () => {
        if (gameState === GameState.Waiting) {
          dispatch(setGameState(GameState.Playing));
        }

        const slotMap = swapyRef.current?.slotItemMap().asObject;

        const internalLayout = [] as string[];

        if (slotMap) {
          Object.keys(slotMap).map((key) => (internalLayout[parseInt(key)] = slotMap[key]));
        }

        if (evaluateGrid(dispatch, solvedGrid, internalLayout)) {
          dispatch(setGameState(GameState.Won));

          jsConfetti.addConfetti();

          db.games.update(1, { completed: 1 });

          await sleep(1800);

          setOverlayVisible(true);
        } else {
          saveGrid(originalLayout.rows, originalLayout.columns, solvedGrid, internalLayout);
        }
      });
    }
    return () => {
      swapyRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  useEffect(() => {
    function handleResize() {
      setAvailableScreenWidth(window.innerWidth - 40);
      setAvailableScreenHeight(window.innerHeight - 120);
    }

    // Attach the event listener to the window object
    window.addEventListener("resize", handleResize);
    screen.orientation.addEventListener("change", handleResize);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
      screen.orientation.removeEventListener("change", handleResize);
    };
  }, []);

  return (
    <div
      key="grid"
      id="grid"
      ref={gridRef}
      className={gridTransition}
      style={{
        gridTemplateRows: `repeat(${originalLayout.rows}, ${tileHeight}px)`,
        gridTemplateColumns: `repeat(${originalLayout.columns}, ${tileWidth}px)`,
      }}
    >
      {originalLayout.tiles.map((i, index) => {
        return (
          <>
            {!i.fixed ? (
              <>
                {gridLoaded && (
                  <div key={`tileDrop${index}`} data-swapy-slot={index}>
                    <div
                      key={`tile${index}`}
                      className={"tile " + tileTransition + (tileHints[index] ? " hint" : "")}
                      style={{
                        backgroundColor: i.tileColor,
                      }}
                      data-swapy-item={i.tileColor}
                    >
                      {!(gameState === GameState.Playing || gameState === GameState.Waiting) && (
                        <div
                          key={`swapPreventionDiv${index}`}
                          data-swapy-no-drag
                          style={{
                            backgroundColor: i.tileColor,
                          }}
                        ></div>
                      )}
                    </div>
                  </div>
                )}
                {!gridLoaded && (
                  <div key={`placeholder${index}`} className="tile placeholder"></div>
                )}
              </>
            ) : (
              <div
                key={`fixedTile${index}`}
                style={{
                  backgroundColor: i.tileColor,
                }}
              >
                <div
                  key={`dot${index}`}
                  className="dot"
                  style={{
                    width: dotSize,
                    height: dotSize,
                    transform:
                      "translate(" +
                      (tileWidth - dotSize) / 2 +
                      "px," +
                      (tileHeight - dotSize) / 2 +
                      "px)",
                  }}
                ></div>
              </div>
            )}
          </>
        );
      })}
    </div>
  );
}

export default Grid;
