import React from 'react';
import MainCard from '../components/Card';
import styles from '../styles/MainPage.module.css';

import musicIcon from '../assets/music-icon.png';
import guitarIcon from '../assets/guitar-icon.png';
import statsIcon from '../assets/stats-icon.png';

function MainPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>로고 (생략가능)</div>
        <div className={styles.nav}>
          <button className={styles.navButton}>👤</button>
          <button className={styles.navButton}>📱</button>
          <button className={styles.navButton}>⚙️</button>
        </div>
      </header>
      <main className={styles.main}>
        <MainCard
          title="음원 목록"
          icon={musicIcon}
          color="orange"
          onClick={() => console.log('음원 목록 클릭')}
        />
        <MainCard
          title="연주하기"
          icon={guitarIcon}
          color="purple"
          onClick={() => console.log('연주하기 클릭')}
        />
        <MainCard
          title="연주 기록"
          icon={statsIcon}
          color="cyan"
          onClick={() => console.log('연주 기록 클릭')}
        />
      </main>
    </div>
  );
}

export default MainPage;
