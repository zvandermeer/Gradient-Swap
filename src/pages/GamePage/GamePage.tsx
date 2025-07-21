import Grid, { GridLayout, Tile } from "./components/Grid/Grid";
import GameHeader from "./components/GameHeader/GameHeader";
import "./gamePage.css";
import { useEffect, useRef, useState } from "react";
import { booleanSetterType, dataURItoBlob, sleep } from "../../helpers";
import { useAppSelector } from "../../hooks";
import { useNavigate } from "react-router";
import PauseOverlay from "./components/PauseOverlay/PauseOverlay";
import { GameState, setGameState } from "./gameSlice";
import { setOriginalGridLayout, setTileTransition } from "./components/Grid/gridSlice";
import { AppDispatch } from "../../store";
import { db } from "../../db";
import { PRNG } from "../../prng";

import html2canvas from "html2canvas";

async function solveGame(
  solveDelay: number,
  dispatch: AppDispatch,
  originalGrid: GridLayout,
  solvedGrid: Tile[],
  setGridLoaded: booleanSetterType
) {
  db.games.update(1, { completed: 1 });

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

interface Props {
  myRng: PRNG;
}

function GamePage({ myRng }: Props) {
  const navigate = useNavigate();

  const originalGrid = useAppSelector((state) => state.grid.value.originalLayout);

  const [pageTransition, setPageTransition] = useState("fade-in");
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [gridLoaded, setGridLoaded] = useState(true);

  const gridRef = useRef<HTMLDivElement>(null);

  function gridScreenshot(): Promise<File> {
    return new Promise(function (resolve, reject) {
      if (gridRef.current) {
        const canvasPromise = html2canvas(gridRef.current, {
          useCORS: true,
          logging: false,
        });
        canvasPromise.then((canvas) => {
          const dataURL = canvas.toDataURL("image/png");

          const blob = dataURItoBlob(dataURL);

          resolve(
            new File([blob], "share.png", {
              type: "image/png",
            })
          );
        });
      } else {
        reject("Canvas reference not initialized properly");
      }
    });
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              myRng={myRng}
            />
            <Grid setOverlayVisible={setOverlayVisible} gridLoaded={gridLoaded} gridRef={gridRef} />
          </div>
          {overlayVisible && (
            <PauseOverlay
              setPageTransition={setPageTransition}
              setOverlayVisible={setOverlayVisible}
              solveGame={solveGame}
              setGridLoaded={setGridLoaded}
              myRng={myRng}
              gridScreenshot={gridScreenshot}
            />
          )}
        </>
      )}
    </>
  );
}

export default GamePage;
