import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const statsSlice = createSlice({
  name: "stats",
  initialState: {
    value: {
      games: 0,
      totalTime: 0,
      swaps: 0,
      fastest: 0,
    },
  },
  reducers: {
    setGames: (state, action: PayloadAction<number>) => {
      state.value.games = action.payload;
    },
    setTotalTime: (state, action: PayloadAction<number>) => {
      state.value.totalTime = action.payload;
    },
    setSwaps: (state, action: PayloadAction<number>) => {
      state.value.swaps = action.payload;
    },
    setFastest: (state, action: PayloadAction<number>) => {
      state.value.fastest = action.payload;
    },
  },
});

export const { setGames, setTotalTime, setSwaps, setFastest } = statsSlice.actions;

export default statsSlice.reducer;
