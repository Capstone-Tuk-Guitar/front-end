import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import homeImage from "../assets/home.svg";
import styles from "../styles/Header.module.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);

  const navigate = useNavigate(); // navigate 훅 사용

  // 각 메뉴 클릭 시 이동하는 함수
  const handleNavigation = (path) => {
    navigate(path); // 해당 경로로 이동
  };

  // 로그아웃 처리 함수
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated"); // 인증 상태 삭제
    navigate("/"); // 로그인 페이지로 이동
  };

  return (
    <header className={`${styles.header} ${isHeaderExpanded ? styles.expanded : ""}`}>
      <img className={styles.home} src={homeImage} onClick={() => handleNavigation('/main')} alt="홈 화면" />

      <div className={`${styles.menu} ${isMenuOpen ? styles.menuExpanded : ""}`}>
        {/* 추가 메뉴 - 전체 메뉴 왼쪽에 표시 */}
        {isMenuOpen && (
          <>
            <span className={styles.menuItem} onClick={() => handleNavigation('/music')}>
              음원 목록
            </span>

            <div
              className={styles.menuItem}
              onMouseEnter={() => setIsSubMenuOpen(true)}
              onMouseLeave={() => setIsSubMenuOpen(false)}
            >
              연주하기
              {isSubMenuOpen && (
                <div className={styles.subMenu}>
                  <span className={styles.subItem} onClick={() => handleNavigation('/practice')}>
                    피드백 연주
                  </span>
                  <span className={styles.subItem} onClick={() => handleNavigation('/practice')}>
                    정확도 연주
                  </span>
                </div>
              )}
            </div>

            <span className={styles.menuItem} onClick={() => handleNavigation('/records')}>
              연주 기록
            </span>
            <span className={styles.menuItem} onClick={() => handleNavigation('/guide')}>사전 가이드</span>
            <span className={styles.menuItem}>설정</span>
          </>
        )}

        <span className={styles.menuItem} onClick={() => {
            setIsMenuOpen(!isMenuOpen);
            setIsHeaderExpanded(!isHeaderExpanded);
          }}>
          전체 메뉴
        </span>
        <span className={styles.menuItem} onClick={() => handleNavigation('/tuning')}>
          튜닝
        </span>
        {/* 로그아웃 버튼 */}
        <span className={styles.menuItem} onClick={handleLogout}>
          로그아웃
        </span>
      </div>
    </header>
  );
};

export default Header;
