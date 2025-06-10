import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";

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
    resetTimer: (state) => {
      state.value.timer = 0;
    },
    incrementTimer: (state) => {
      state.value.timer += 1;
    },
    resetSwaps: (state) => {
      state.value.swaps = 0;
    },
    incrementSwaps: (state) => {
      state.value.swaps += 1;
    },
  },
});

export const {
  setGameState,
  setStatsEnabled,
  resetTimer,
  incrementTimer,
  resetSwaps,
  incrementSwaps,
} = gameSlice.actions;

export const selectGrid = (state: RootState) => state.grid.value;

export default gameSlice.reducer;
