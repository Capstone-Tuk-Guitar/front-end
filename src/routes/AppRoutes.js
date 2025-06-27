import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// 코드 분할을 위한 Lazy Loading
const LoginPage = React.lazy(() => import("../pages/LoginPage"));
const SignUpPage = React.lazy(() => import("../pages/SignUpPage"));
const MainPage = React.lazy(() => import('../pages/MainPage'));
const MusicPage = React.lazy(() => import("../pages/MusicPage"));
const SelectSongPage = React.lazy(() => import("../pages/SelectSongPage"));
const PracticePage = React.lazy(() => import('../pages/PracticePage'));
const AccuracyPage = React.lazy(() => import('../pages/AccuracyPage'));
const DetailDiffPage = React.lazy(() => import('../pages/DetailDiffPage'));
const RecordPage = React.lazy(() => import('../pages/RecordPage'));
const TuningPage = React.lazy(() => import('../pages/TuningPage'));
const ChordPage = React.lazy(() => import('../pages/ChordPage'));

// 로딩 컴포넌트
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px'
  }}>
    로딩 중...
  </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/music" element={<MusicPage />} />
        <Route path='/select_song' element={<SelectSongPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/accuracy" element={<AccuracyPage />} />
        <Route path="/detail_diff" element={<DetailDiffPage />} />
        <Route path="/records" element={<RecordPage />} />
        <Route path="/tuning" element={<TuningPage />} />
        <Route path="/chord" element={<ChordPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
