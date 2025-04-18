import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import MainPage from '../pages/MainPage';
import MusicPage from "../pages/MusicPage";
import SelectSongPage from "../pages/SelectSongPage";
import PracticePage from '../pages/PracticePage';
import AccuracyPage from '../pages/AccuracyPage';
import RecordPage from '../pages/RecordPage';
import GuidePage from '../pages/GuidePage';
import TuningPage from '../pages/TuningPage';
import ChordPage from '../pages/ChordPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/music" element={<MusicPage />} />
      <Route path='/select_song' element={<SelectSongPage />} />
      <Route path="/practice" element={<PracticePage />} />
      <Route path="/accuracy" element={<AccuracyPage />} />
      <Route path="/records" element={<RecordPage />} />
      <Route path="/guide" element={<GuidePage />} />
      <Route path="/tuning" element={<TuningPage />} />
      <Route path="/chord" element={<ChordPage />} />
    </Routes>
  );
}

export default AppRoutes;
