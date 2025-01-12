import React from 'react';
import { Link } from 'react-router-dom';

function MainPage() {
  return (
    <div>
      <h1>메인 화면</h1>
      <div>
        <Link to="/practice">연주하기</Link>
        <Link to="/records">연주 기록</Link>
        <Link to="/tuning">튜닝 설정</Link>
        <Link to="/guide">기타 가이드</Link>
      </div>
    </div>
  );
}

export default MainPage;
