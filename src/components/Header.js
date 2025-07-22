import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import homeImage from "../assets/home.svg";
import styles from "../styles/Header.module.css";

const Header = ({ className = "", id = "" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);

  const navigate = useNavigate();

  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  }, [navigate]);

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
    setIsHeaderExpanded((prev) => !prev);
  }, []);

  return (
    <header
      className={`${styles.header} ${isHeaderExpanded ? styles.expanded : ""} ${className}`}
      id={id}
    >
      <img
        className={styles.home}
        src={homeImage}
        onClick={() => handleNavigation("/main")}
        alt="홈 화면"
      />
      <div className={`${styles.menu} ${isMenuOpen ? styles.menuExpanded : ""}`}>
        {isMenuOpen && (
          <>
            <span className={styles.menuItem} onClick={() => handleNavigation("/music")}>
              음원 목록
            </span>
            <span className={styles.menuItem} onClick={() => handleNavigation("/select_song")}>
              연주하기
            </span>
            <span className={styles.menuItem} onClick={() => handleNavigation("/records")}>
              연주 기록
            </span>
            <span className={styles.menuItem} onClick={() => handleNavigation("/chord")}>
              음 연습
            </span>
          </>
        )}
        <span className={styles.menuItem} onClick={handleMenuToggle}>
          전체 메뉴
        </span>
        <span className={styles.menuItem} onClick={() => handleNavigation("/tuning")}>
          튜닝
        </span>
        <span className={styles.menuItem} onClick={handleLogout}>
          로그아웃
        </span>
      </div>
    </header>
  );
};

export default React.memo(Header);  