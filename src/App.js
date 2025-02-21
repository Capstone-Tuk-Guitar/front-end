import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import MusicPage from "./pages/MusicPage";
import RecordPage from "./pages/RecordPage";
import TuningPage from "./pages/TuningPage";
import PracticePage from "./pages/PracticePage";

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
      {/* {isAuthenticated ? (
        <> */}
      <Route path="/main" element={<MainPage />} />
      <Route path="/music" element={<MusicPage />} />
      <Route path="/record" element={<RecordPage />} />
      <Route path="/tuning" element={<TuningPage />} />
      <Route path="/practice" element={<PracticePage />} />
        {/* </>
      ) : null} */}
    </Routes>
  );
};

export default App;
