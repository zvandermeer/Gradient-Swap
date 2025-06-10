import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setGridColumns, setGridRows } from "../GamePage/components/Grid/gridSlice";
import "./welcomePage.css";
import { useEffect, useState } from "react";
import { newLevel } from "../GamePage/generation";
import { sleep } from "../../helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { GameState, setGameState } from "../GamePage/gameSlice";
import { AppDispatch } from "../../store";

function updateDimensions(dispatch: AppDispatch, columns: number, rows: number) {
  dispatch(setGridColumns(columns));
  dispatch(setGridRows(rows));
}

function WelcomePage() {
  let navigate = useNavigate();
  const dispatch = useAppDispatch();

  const rows = useAppSelector((state) => state.grid.value.rows);
  const columns = useAppSelector((state) => state.grid.value.columns);
  const gameState = useAppSelector((state) => state.game.value.gameState);

  const [pageTransition, setPageTransition] = useState("");

  useEffect(() => {
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

          newLevel(dispatch, rows, columns, 500, false);

          navigate("game");
        }}
      >
        Generate grid!
      </button>
    </div>
  );
}

export default WelcomePage;
