import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import MusicPage from "./pages/MusicPage";
import RecordPage from "./pages/RecordPage"

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/music" element={<MusicPage />} />
      <Route path="/record" element={<RecordPage />} />
    </Routes>
  );
}

export default App;
