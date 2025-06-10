import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../../store";
import type { GridLayout, Tile } from "./Grid";

export const gridSlice = createSlice({
  name: "grid",
  initialState: {
    value: {
      gridTransition: "",
      rows: 5,
      columns: 5,
      tileTransition: "",
      originalLayout: {} as GridLayout,
      solvedGrid: [] as Tile[],
      incorrectTiles: [] as number[],
      visibleHints: [] as boolean[],
    },
  },
  reducers: {
    setGridTransition: (state, action: PayloadAction<string>) => {
      state.value.gridTransition = action.payload;
    },
    setGridRows: (state, action: PayloadAction<number>) => {
      if (action.payload >= 3) {
        state.value.rows = action.payload;
      }
    },
    setGridColumns: (state, action: PayloadAction<number>) => {
      if (action.payload >= 3) {
        state.value.columns = action.payload;
      }
    },
    setTileTransition: (state, action: PayloadAction<string>) => {
      state.value.tileTransition = action.payload;
    },
    setOriginalGridLayout: (state, action: PayloadAction<GridLayout>) => {
      state.value.originalLayout = action.payload;
    },
    setSolvedGridLayout: (state, action: PayloadAction<Tile[]>) => {
      state.value.solvedGrid = action.payload;
    },
    setIncorrectTiles: (state, action: PayloadAction<number[]>) => {
      state.value.incorrectTiles = action.payload;
    },
    setVisibleHints: (state, action: PayloadAction<boolean[]>) => {
      state.value.visibleHints = action.payload;
    },
  },
});

export const {
  setGridTransition,
  setGridRows,
  setGridColumns,
  setTileTransition,
  setOriginalGridLayout,
  setSolvedGridLayout,
  setIncorrectTiles,
  setVisibleHints,
} = gridSlice.actions;

export default gridSlice.reducer;
