import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.module.css';   // CSS 모듈 사용

function Header() {
  return (
    <header>
      <h1>React Guitar App</h1>
      <nav>
        <Link to="/">메인</Link>
        <Link to="/practice">연주하기</Link>
        <Link to="/records">연주 기록</Link>
      </nav>
    </header>
  );
}

export default Header;
