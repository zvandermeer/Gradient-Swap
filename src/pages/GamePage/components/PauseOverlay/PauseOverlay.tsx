import { useNavigate } from "react-router";
import { booleanSetterType, sleep } from "../../../../helpers";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import { newLevel } from "../../generation";
import { setGridColumns, setGridRows } from "../Grid/gridSlice";
import "./PauseOverlay.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMinus,
  faArrowRotateRight,
  faShareNodes,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { GameState, setGameState } from "../../gameSlice";
import { faCircleCheck, faRectangleXmark } from "@fortawesome/free-regular-svg-icons";
import { AppDispatch } from "../../../../store";
import { GridLayout, Tile } from "../Grid/Grid";

type solveGameFunc = (
  solveDelay: number,
  dispatch: AppDispatch,
  originalGrid: GridLayout,
  solvedGrid: Tile[],
  setGridLoaded: booleanSetterType
) => void;

interface Props {
  setGridLoaded: booleanSetterType;
  setPageTransition: (state: string) => void;
  setOverlayVisible: booleanSetterType;
  solveGame: solveGameFunc;
}

async function closeOverlay(
  setOverlayHiding: booleanSetterType,
  setOverlayVisible: booleanSetterType,
  dispatch: AppDispatch,
  shouldResume: boolean
) {
  setOverlayHiding(true);

  await sleep(500);

  if (shouldResume) {
    dispatch(setGameState(GameState.Playing));
  }

  setOverlayVisible(false);
}

function createButton(
  dispatch: AppDispatch,
  rows: number,
  columns: number,
  setGridLoaded: booleanSetterType,
  setOverlayHiding: booleanSetterType,
  setOverlayVisible: booleanSetterType
) {
  newLevel(dispatch, rows, columns, 300, true, setGridLoaded);

  closeOverlay(setOverlayHiding, setOverlayVisible, dispatch, false);
}

function solveButton(
  dispatch: AppDispatch,
  solveGame: solveGameFunc,
  originalGrid: GridLayout,
  solvedGrid: Tile[],
  setGridLoaded: booleanSetterType,
  setOverlayHiding: booleanSetterType,
  setOverlayVisible: booleanSetterType
) {
  solveGame(600, dispatch, originalGrid, solvedGrid, setGridLoaded);
  closeOverlay(setOverlayHiding, setOverlayVisible, dispatch, false);
}

async function shareButton(rows: number, columns: number, timer: number, swaps: number) {
  const shareData = {
    text: `Gradient Game (${columns}x${rows})\nFinished in: ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, "0")}\nTotal swaps: ${swaps}\nPlay: https://gradient.starlightt.xyz`,
  };

  await navigator.share(shareData);
}

function PauseOverlay({ setGridLoaded, setPageTransition, setOverlayVisible, solveGame }: Props) {
  let navigate = useNavigate();

  const dispatch = useAppDispatch();

  const rows = useAppSelector((state) => state.grid.value.rows);
  const columns = useAppSelector((state) => state.grid.value.columns);
  const gameState = useAppSelector(
    (state) => state.game.value.gameState,
    () => true
  );
  const statsEnabled = useAppSelector((state) => state.game.value.statsEnabled);
  const swaps = useAppSelector((state) => state.game.value.swaps);
  const timer = useAppSelector((state) => state.game.value.timer);
  const originalGrid = useAppSelector((state) => state.grid.value.originalLayout);
  const solvedGrid = useAppSelector((state) => state.grid.value.solvedGrid);

  const [overlayHiding, setOverlayHiding] = useState(false);
  const [overlayHeader, setOverlayHeader] = useState("");
  const [overlayScale, setOverlayScale] = useState(0);

  useEffect(() => {
    switch (gameState) {
      case GameState.Won: {
        setOverlayHeader("You win!");
        break;
      }
      case GameState.Lost: {
        setOverlayHeader("Play again?");
        break;
      }
      case GameState.Waiting:
      case GameState.Paused: {
        setOverlayHeader("Game paused");
        break;
      }
      default: {
        setOverlayHeader("Unknown game state");
        break;
      }
    }
  });

  useEffect(() => {
    function handleResize() {
      if (window.innerHeight < 555) {
        setOverlayScale(2);
      } else if (window.innerHeight < 640) {
        setOverlayScale(1);
      } else {
        setOverlayScale(0);
      }
    }

    // Attach the event listener to the window object
    window.addEventListener("resize", handleResize);

    handleResize();

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className={"overlay " + (overlayHiding ? "hide" : "")}>
      <div className="box">
        <h2>{overlayHeader}</h2>
        {statsEnabled && (
          <div className="stats">
            <div className="time">
              <div>Time:</div>
              <div>
                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
              </div>
            </div>
            <div className="swaps">
              <div>Swaps:</div>
              <div>{swaps}</div>
            </div>
          </div>
        )}
        <div className="final-dimension-adjust">
          <div>
            <p>Width</p>
            <button className="button" onClick={() => dispatch(setGridColumns(columns + 1))}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <p>{columns}</p>
            <button className="button" onClick={() => dispatch(setGridColumns(columns - 1))}>
              <FontAwesomeIcon icon={faMinus} />
            </button>
          </div>
          <div>
            <p>Height</p>
            <button className="button" onClick={() => dispatch(setGridRows(rows + 1))}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <p>{rows}</p>
            <button className="button" onClick={() => dispatch(setGridRows(rows - 1))}>
              <FontAwesomeIcon icon={faMinus} />
            </button>
          </div>
        </div>
        {overlayScale < 2 && (
          <div className="button-div">
            <button
              className="button"
              onClick={() =>
                createButton(
                  dispatch,
                  rows,
                  columns,
                  setGridLoaded,
                  setOverlayHiding,
                  setOverlayVisible
                )
              }
            >
              <FontAwesomeIcon icon={faArrowRotateRight} size="xs" /> New Game!
            </button>
          </div>
        )}
        {(gameState === GameState.Paused || gameState === GameState.Waiting) &&
          overlayScale === 0 && (
            <div className="button-div">
              <button
                className="button"
                onClick={() =>
                  solveButton(
                    dispatch,
                    solveGame,
                    originalGrid,
                    solvedGrid,
                    setGridLoaded,
                    setOverlayHiding,
                    setOverlayVisible
                  )
                }
              >
                <FontAwesomeIcon icon={faCircleCheck} /> Show solution
              </button>
            </div>
          )}
        {gameState === GameState.Won && overlayScale === 0 && (
          <div className="button-div">
            <button className="button">
              <FontAwesomeIcon
                icon={faShareNodes}
                onClick={() => shareButton(rows, columns, timer, swaps)}
              />{" "}
              Share!
            </button>
          </div>
        )}
        <div className="button-div">
          <button
            className="button"
            onClick={() => closeOverlay(setOverlayHiding, setOverlayVisible, dispatch, true)}
          >
            <FontAwesomeIcon icon={faRectangleXmark} size="lg" />
          </button>
          {(gameState === GameState.Paused || gameState === GameState.Waiting) &&
            overlayScale > 0 && (
              <button
                className="button"
                onClick={() => {
                  solveButton(
                    dispatch,
                    solveGame,
                    originalGrid,
                    solvedGrid,
                    setGridLoaded,
                    setOverlayHiding,
                    setOverlayVisible
                  );
                }}
              >
                <FontAwesomeIcon icon={faCircleCheck} />
              </button>
            )}
          {gameState === GameState.Won && overlayScale > 1 && (
            <button className="button">
              <FontAwesomeIcon
                icon={faShareNodes}
                onClick={() => shareButton(rows, columns, timer, swaps)}
              />
            </button>
          )}
          {overlayScale === 2 && (
            <button
              className="button"
              onClick={() =>
                createButton(
                  dispatch,
                  rows,
                  columns,
                  setGridLoaded,
                  setOverlayHiding,
                  setOverlayVisible
                )
              }
            >
              <FontAwesomeIcon icon={faArrowRotateRight} size="xs" />
            </button>
          )}
          <button
            className="button"
            onClick={async () => {
              closeOverlay(setOverlayHiding, setOverlayVisible, dispatch, false);
              setPageTransition("fade-out");

              await sleep(500);

              navigate("/");
            }}
          >
            <FontAwesomeIcon icon={faHouse} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PauseOverlay;
