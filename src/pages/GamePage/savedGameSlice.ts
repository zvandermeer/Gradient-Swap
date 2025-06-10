import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GridLayout, Tile } from "./components/Grid/Grid";

export const gameSlice = createSlice({
  name: "game",
  initialState: {
    value: {
      active: false,
      rows: 5,
      columns: 5,
      swaps: 0,
      timer: 0,
      currentLayout: {} as GridLayout,
      solvedGrid: [] as Tile[],
    },
  },
  reducers: {
    setSavedGameActive: (state, action: PayloadAction<boolean>) => {
      state.value.active = action.payload;
    },
    setSavedRows: (state, action: PayloadAction<number>) => {
      state.value.rows = action.payload;
    },
    setSavedColumns: (state, action: PayloadAction<number>) => {
      state.value.columns = action.payload;
    },
    setSavedSwaps: (state, action: PayloadAction<number>) => {
      state.value.swaps = action.payload;
    },
    setSavedTimer: (state, action: PayloadAction<number>) => {
      state.value.timer = action.payload;
    },
    setSavedCurrentLayout: (state, action: PayloadAction<GridLayout>) => {
      state.value.currentLayout = action.payload;
    },
    setSavedSolvedGrid: (state, action: PayloadAction<Tile[]>) => {
      state.value.solvedGrid = action.payload;
    },
  },
});

export const {
  setSavedGameActive,
  setSavedRows,
  setSavedColumns,
  setSavedSwaps,
  setSavedTimer,
  setSavedCurrentLayout,
  setSavedSolvedGrid
} = gameSlice.actions;

export default gameSlice.reducer;
