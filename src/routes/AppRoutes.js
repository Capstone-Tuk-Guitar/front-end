import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from '../pages/MainPage';
import LoginPage from '../pages/LoginPage';
import SignUpPage from '../pages/SignUpPage';
import PracticePage from '../pages/PracticePage';
import TuningPage from '../pages/TuningPage';
import GuidePage from '../pages/GuidePage';
import RecordPage from '../pages/RecordPage';
import AccuracyPage from '../pages/AccuracyPage';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/tuning" element={<TuningPage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/records" element={<RecordPage />} />
        <Route path="/accuracy" element={<AccuracyPage />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
