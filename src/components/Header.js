import React from "react";
import styles from "../styles/Header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>로고</div>
      <div className={styles.menu}>
        <span className={styles.menuItem}>전체 메뉴</span>
        <span className={styles.menuItem}>로그아웃</span>
      </div>
    </header>
  );
};

export default Header;
