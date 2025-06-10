import { configureStore } from "@reduxjs/toolkit";
import gridReducer from "./pages/GamePage/components/Grid/gridSlice";
import gameReducer from "./pages/GamePage/gameSlice";

export const store = configureStore({
  reducer: {
    grid: gridReducer,
    game: gameReducer,
  },
});

// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
