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
}

function evaluateGrid(
  dispatch: AppDispatch,
  solvedGridLayout: Tile[],
  internalGridLayout: String[]
): boolean {
  var incorrectTiles = [];

  for (var i = 0; i < solvedGridLayout.length; i++) {
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

function Grid({ setOverlayVisible, gridLoaded }: Props) {
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

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      swapyRef.current = createSwapy(containerRef.current, {
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

          await sleep(1800);

          setOverlayVisible(true);
        }
      });
    }
    return () => {
      swapyRef.current?.destroy();
    };
  }, [gameState]);

  useEffect(() => {
    function handleResize() {
      setAvailableScreenWidth(window.innerWidth - 40);
      setAvailableScreenHeight(window.innerHeight - 120);
    }

    // Attach the event listener to the window object
    window.addEventListener("resize", handleResize);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      key="grid"
      id="grid"
      ref={containerRef}
      className={gridTransition}
      style={{
        display: "grid",
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
                        width: tileWidth,
                        height: tileHeight,
                      }}
                      data-swapy-item={i.tileColor}
                    >
                      {!(gameState === GameState.Playing || gameState === GameState.Waiting) && (
                        <div
                          key={`swapPreventionDiv${index}`}
                          data-swapy-no-drag
                          style={{
                            backgroundColor: i.tileColor,
                            width: tileWidth,
                            height: tileHeight,
                          }}
                        ></div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div
                key={`fixedTile${index}`}
                style={{
                  backgroundColor: i.tileColor,
                  width: tileWidth,
                  height: tileHeight,
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
