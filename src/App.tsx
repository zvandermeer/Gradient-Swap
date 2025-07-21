import { BrowserRouter, Route, Routes } from "react-router";
import GamePage from "./pages/GamePage/GamePage";
import WelcomePage from "./pages/WelcomePage/WelcomePage";
import { useEffect } from "react";
import { useAppDispatch } from "./hooks";
import { loadDb } from "./db";
import { PRNG } from "./prng";

function App() {
  const dispatch = useAppDispatch();
  const myRng = new PRNG();

  useEffect(() => {
    loadDb(dispatch);
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage myRng={myRng} />} />
        <Route path="game" element={<GamePage myRng={myRng} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
