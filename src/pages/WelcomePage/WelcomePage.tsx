import { useNavigate, useSearchParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setGridColumns, setGridRows } from "../GamePage/components/Grid/gridSlice";
import "./welcomePage.css";
import { useEffect, useState } from "react";
import { loadSavedLevel, newLevel } from "../GamePage/generation";
import { sleep } from "../../helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { GameState, setGameState } from "../GamePage/gameSlice";
import { db, Games } from "../../db";
import { PRNG } from "../../prng";

interface Props {
  myRng: PRNG
}

function WelcomePage({ myRng }: Props) {
  let navigate = useNavigate();
  const dispatch = useAppDispatch();

  const rows = useAppSelector((state) => state.grid.value.rows);
  const columns = useAppSelector((state) => state.grid.value.columns);
  const gameState = useAppSelector((state) => state.game.value.gameState);

  const [pageTransition, setPageTransition] = useState("");

  const [lastGame, setLastGame] = useState<Games | undefined>(undefined);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const run = async () => {
      const myLastGame = await db.games.where("completed").equals(0).first();
      setLastGame(myLastGame);
    }
    run();

    const seed = searchParams.get('seed')
    
    if(seed) {
      myRng.setSeed(Number(seed))
      setSearchParams(new URLSearchParams());
    }
    
    if (gameState !== GameState.Home) {
      dispatch(setGameState(GameState.Home));
      setPageTransition("fade-in");
    }
  }, []);

  return (
    <div id="welcome-screen" className={pageTransition}>
      <div>
        <h1>Colour Swap!</h1>
        <h2>Select your grid size</h2>
      </div>
      <div className="dimension-button-container">
        <div>Width</div>
        <div className="dimension-button">
          <button className="button" onClick={() => dispatch(setGridColumns(columns + 1))}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
          <p>{columns}</p>
          <button className="button" onClick={() => dispatch(setGridColumns(columns - 1))}>
            <FontAwesomeIcon icon={faMinus} />
          </button>
        </div>
        <div>Height</div>
        <div className="dimension-button">
          <button className="button" onClick={() => dispatch(setGridRows(rows + 1))}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
          <p>{rows}</p>
          <button className="button" onClick={() => dispatch(setGridRows(rows - 1))}>
            <FontAwesomeIcon icon={faMinus} />
          </button>
        </div>
      </div>
      <button
        className="button create-button"
        onClick={async () => {
          setPageTransition("fade-out");

          await sleep(500);

          newLevel(dispatch, rows, columns, 500, false, myRng);

          navigate("game");
        }}
      >
        Generate grid!
      </button>
      {lastGame && (
        <button
          className="button create-button"
          onClick={async () => {
            setPageTransition("fade-out");

            await sleep(500);

            loadSavedLevel(dispatch, lastGame.swaps, lastGame.time, lastGame.currentLayout, lastGame.solvedGrid);

            navigate("game");
          }}
        >
          Load saved game
        </button>
      )}
    </div>
  );
}

export default WelcomePage;
