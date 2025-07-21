import { useAppDispatch, useAppSelector } from "../../hooks";
import "./gameHeader.css";
import { newLevel } from "../../pages/GamePage/generation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateRight, faBars, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { GameState, incrementTimer, setGameState } from "../../pages/GamePage/gameSlice";
import { useEffect } from "react";
import { booleanSetterType, sleep } from "../../helpers";
import { setVisibleHints } from "../Grid/gridSlice";
import { PRNG } from "../../prng";

interface Props {
  setGridLoaded: booleanSetterType;
  setOverlayVisible: booleanSetterType;
  overlayVisible: boolean;
  myRng: PRNG;
}

function GameHeader({ setGridLoaded, setOverlayVisible, overlayVisible, myRng }: Props) {
  const dispatch = useAppDispatch();

  const rows = useAppSelector((state) => state.grid.value.rows);
  const columns = useAppSelector((state) => state.grid.value.columns);
  const gameState = useAppSelector((state) => state.game.value.gameState);
  const statsEnabled = useAppSelector((state) => state.game.value.statsEnabled);
  const swaps = useAppSelector((state) => state.game.value.swaps);
  const timer = useAppSelector((state) => state.game.value.timer);
  const incorrectTiles = useAppSelector((state) => state.grid.value.incorrectTiles);
  const visibleHints = useAppSelector((state) => state.grid.value.visibleHints);

  useEffect(() => {
    const x = setInterval(function () {
      if (gameState === GameState.Playing) {
        dispatch(incrementTimer());
      }
    }, 1000);

    return () => {
      clearInterval(x);
    };
  }, [gameState, dispatch]);

  return (
    <div id="controls">
      <div id="header-buttons">
        <button
          className="button"
          onClick={() => {
            if (!overlayVisible && gameState !== GameState.Generating) {
              if (gameState === GameState.Playing) {
                dispatch(setGameState(GameState.Paused));
              }
              setOverlayVisible(true);
            }
          }}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <button
          onClick={async () => {
            if (!overlayVisible && gameState !== GameState.Generating) {
              newLevel(dispatch, rows, columns, 300, true, myRng, true, setGridLoaded);
            }
          }}
          className="button"
        >
          <FontAwesomeIcon icon={faArrowRotateRight} />
        </button>
        <button
          className="button"
          onClick={async () => {
            const incorrectTile = incorrectTiles[Math.floor(Math.random() * incorrectTiles.length)];

            let newHints: boolean[] = Object.assign([], visibleHints);
            newHints[incorrectTile] = true;

            dispatch(setVisibleHints(newHints));

            await sleep(3000);

            newHints = Object.assign([], visibleHints);
            newHints[incorrectTile] = false;

            dispatch(setVisibleHints(newHints));
          }}
        >
          <FontAwesomeIcon icon={faLightbulb} />
        </button>
      </div>
      {statsEnabled && (
        <div id="header-stats">
          <div>
            <span>Swaps: {swaps}</span>
            <span>
              {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameHeader;
