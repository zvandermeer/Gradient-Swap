import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { db } from "../../db";

export enum GameState {
  Playing,
  Paused,
  Won,
  Lost,
  Generating,
  Waiting,
  Home,
}

export const gameSlice = createSlice({
  name: "game",
  initialState: {
    value: {
      gameState: GameState.Home,
      statsEnabled: true,
      swaps: 0,
      timer: 0,
    },
  },
  reducers: {
    setGameState: (state, action: PayloadAction<GameState>) => {
      state.value.gameState = action.payload;
    },
    setStatsEnabled: (state, action: PayloadAction<boolean>) => {
      state.value.statsEnabled = action.payload;
    },
    setTimer: (state, action: PayloadAction<number>) => {
      state.value.timer = action.payload;
    },
    resetTimer: (state) => {
      state.value.timer = 0;
    },
    incrementTimer: (state) => {
      state.value.timer += 1;
      db.games.update(1, { time: state.value.timer });
    },
    setSwaps: (state, action: PayloadAction<number>) => {
      state.value.swaps = action.payload;
    },
    resetSwaps: (state) => {
      state.value.swaps = 0;
    },
    incrementSwaps: (state) => {
      state.value.swaps += 1;
      db.games.update(1, { swaps: state.value.swaps });
    },
  },
});

export const {
  setGameState,
  setStatsEnabled,
  setTimer,
  resetTimer,
  incrementTimer,
  setSwaps,
  resetSwaps,
  incrementSwaps,
} = gameSlice.actions;

export default gameSlice.reducer;
