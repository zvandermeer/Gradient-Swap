import Grid, { GridLayout, Tile } from "./components/Grid/Grid";
import GameHeader from "./components/GameHeader/GameHeader";
import "./gamePage.css";
import { useEffect, useState } from "react";
import { booleanSetterType, sleep } from "../../helpers";
import { useAppSelector } from "../../hooks";
import { useNavigate } from "react-router";
import PauseOverlay from "./components/PauseOverlay/PauseOverlay";
import { GameState, setGameState } from "./gameSlice";
import { setOriginalGridLayout, setTileTransition } from "./components/Grid/gridSlice";
import { AppDispatch } from "../../store";
import { db } from "../../db";

async function solveGame(
  solveDelay: number,
  dispatch: AppDispatch,
  originalGrid: GridLayout,
  solvedGrid: Tile[],
  setGridLoaded: booleanSetterType
) {
  db.games.update(1, {completed: 1})

  await sleep(solveDelay);

  dispatch(setTileTransition("shrink"));

  await sleep(500);

  setGridLoaded(false);

  dispatch(
    setOriginalGridLayout({
      rows: originalGrid.rows,
      columns: originalGrid.columns,
      tiles: solvedGrid,
    })
  );

  await sleep(300);

  setGridLoaded(true);

  dispatch(setTileTransition("full"));

  await sleep(500);

  dispatch(setTileTransition(""));
  dispatch(setGameState(GameState.Lost));
}

function GamePage() {
  let navigate = useNavigate();

  const originalGrid = useAppSelector((state) => state.grid.value.originalLayout);

  const [pageTransition, setPageTransition] = useState("fade-in");
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [gridLoaded, setGridLoaded] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (Object.keys(originalGrid).length === 0) {
        navigate("/");
      } else {
        if (pageTransition === "fade-in") {
          await sleep(500);
          setPageTransition("");
        }
      }
    };
    run();
  }, []);

  return (
    <>
      {Object.keys(originalGrid).length !== 0 && (
        <>
          <div id="game-screen" className={pageTransition}>
            <GameHeader
              setOverlayVisible={setOverlayVisible}
              overlayVisible={overlayVisible}
              setGridLoaded={setGridLoaded}
            />
            <Grid setOverlayVisible={setOverlayVisible} gridLoaded={gridLoaded} />
          </div>
          {overlayVisible && (
            <PauseOverlay
              setPageTransition={setPageTransition}
              setOverlayVisible={setOverlayVisible}
              solveGame={solveGame}
              setGridLoaded={setGridLoaded}
            />
          )}
        </>
      )}
    </>
  );
}

export default GamePage;
