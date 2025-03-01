import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import MusicPage from "./pages/MusicPage";
import RecordPage from "./pages/RecordPage";
import TuningPage from "./pages/TuningPage";
import PracticePage from "./pages/PracticePage";
import AccuracyPage from "./pages/AccuracyPage";

const App = () => {
  const [, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(authStatus === "true");
    if (!authStatus) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path='/signup' element={<SignUpPage />} />
      {/* {isAuthenticated ? (
        <> */}
      <Route path="/main" element={<MainPage />} />
      <Route path="/music" element={<MusicPage />} />
      <Route path="/record" element={<RecordPage />} />
      <Route path="/tuning" element={<TuningPage />} />
      <Route path="/practice" element={<PracticePage />} />
      <Route path="/accuracy" element={<AccuracyPage />} />
        {/* </>
      ) : null} */}
    </Routes>
  );
};

export default App;
