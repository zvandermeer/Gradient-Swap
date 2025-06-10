// db.ts
import Dexie, { type EntityTable } from "dexie";
import { GridLayout, Tile } from "./pages/GamePage/components/Grid/Grid";
import { AppDispatch } from "./store";
import { setFastest, setGames, setSwaps, setTotalTime } from "./pages/WelcomePage/statsSlice";
import { setGridColumns, setGridRows } from "./pages/GamePage/components/Grid/gridSlice";
import { setStatsEnabled } from "./pages/GamePage/gameSlice";
import {
  setSavedColumns,
  setSavedCurrentLayout,
  setSavedGameActive,
  setSavedRows,
  setSavedSolvedGrid,
  setSavedSwaps,
  setSavedTimer,
} from "./pages/GamePage/savedGameSlice";

interface Games {
  id: number;
  completed: number; // bool, 1 or 0
  swaps: number;
  time: number;
  rows: number;
  columns: number;
  currentLayout: GridLayout;
  solvedGrid: Tile[];
}

interface Stats {
  id: number;
  games: number;
  totalTime: number;
  swaps: number;
  fastest: number;
}

interface Settings {
  id: number;
  statsVisible: number; // bool, 1 or 0
  rows: number;
  columns: number;
}

const db = new Dexie("GameDB") as Dexie & {
  games: EntityTable<
    Games,
    "id" // primary key "id" (for the typings only)
  >;
  stats: EntityTable<
    Stats,
    "id" // primary key "id" (for the typings only)
  >;
  settings: EntityTable<
    Settings,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  games: "++id, completed, swaps, time, rows, columns, currentLayout, solvedGrid", // primary key "id" (for the runtime!)
  stats: "++id, games, totalTime, swaps, fastest", // primary key "id" (for the runtime!)
  settings: "++id, statsVisible, rows, columns", // primary key "id" (for the runtime!)
});

export type { Games, Stats, Settings };
export { db };

export async function loadDb(dispatch: AppDispatch) {
  console.log("Loading DB...")

  const userStats = await db.stats.get(1);

  if (userStats) {
    if (userStats.games) {
      dispatch(setGames(userStats.games));
    }
    if (userStats.totalTime) {
      dispatch(setTotalTime(userStats.totalTime));
    }
    if (userStats.swaps) {
      dispatch(setSwaps(userStats.swaps));
    }
    if (userStats.fastest) {
      dispatch(setFastest(userStats.fastest));
    }
  } else {
    await db.stats.put({ id: 1, games: 0, totalTime: 0, swaps: 0, fastest: -1 });
  }

  const userSettings = await db.settings.get(1);

  if (userSettings) {
    if (userSettings.columns) {
      dispatch(setGridColumns(userSettings.columns));
    }
    if (userSettings.rows) {
      dispatch(setGridRows(userSettings.rows));
    }
    if (userSettings.statsVisible) {
      dispatch(setStatsEnabled(userSettings.statsVisible == 1));
    }
  } else {
    await db.settings.add({ id: 1, statsVisible: 1, rows: 5, columns: 5 });
  }

  const lastGame = await db.games.where("completed").equals(0).first();
  if (lastGame) {
    dispatch(setSavedGameActive(true));

    if (lastGame.swaps) {
      dispatch(setSavedSwaps(lastGame.swaps));
    }
    if (lastGame.time) {
      dispatch(setSavedTimer(lastGame.time));
    }
    if (lastGame.rows) {
      dispatch(setSavedRows(lastGame.rows));
    }
    if (lastGame.columns) {
      dispatch(setSavedColumns(lastGame.columns));
    }
    if (lastGame.currentLayout) {
      dispatch(setSavedCurrentLayout(lastGame.currentLayout));
    }
    if (lastGame.solvedGrid) {
      dispatch(setSavedSolvedGrid(lastGame.solvedGrid));
    }
  }
}
