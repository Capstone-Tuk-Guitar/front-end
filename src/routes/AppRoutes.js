import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from '../pages/MainPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import PracticePage from '../pages/PracticePage';
import TuningPage from '../pages/TuningPage';
import GuidePage from '../pages/GuidePage';
import RecordPage from '../pages/RecordPage';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/tuning" element={<TuningPage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/records" element={<RecordPage />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
