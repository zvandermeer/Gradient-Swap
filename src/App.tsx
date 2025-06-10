import { BrowserRouter, Route, Routes } from "react-router";
import GamePage from "./pages/GamePage/GamePage";
import WelcomePage from "./pages/WelcomePage/WelcomePage";

function App() {
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
