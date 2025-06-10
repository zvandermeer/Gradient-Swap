import { BrowserRouter, Route, Routes } from "react-router";
import GamePage from "./pages/GamePage/GamePage";
import WelcomePage from "./pages/WelcomePage/WelcomePage";
import { useEffect } from "react";
import { useAppDispatch } from "./hooks";
import { loadDb } from "./db";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    loadDb(dispatch);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="game" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
