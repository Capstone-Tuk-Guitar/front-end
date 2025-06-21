import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Card.module.css";

const Card = ({ image, text, isActive, position }) => {
  // 페이지 이동 함수
  const navigate = useNavigate();

  // 위치에 따른 클래스를 useMemo로 메모이제이션
  const positionClass = useMemo(() => {
    if (position === -1) {
      return styles.left; // 왼쪽 카드
    } else if (position === 1) {
      return styles.right; // 오른쪽 카드
    } else if (position !== 0) {
      return styles.hidden; // 숨겨진 카드
    }
    return "";
  }, [position]);

  // 내비게이션 경로를 useMemo로 메모이제이션
  const navigationPath = useMemo(() => {
    const pathMap = {
      "음원 목록": "/music",
      "연주하기": "/select_song",
      "비교하기": "/accuracy",
      "연주 기록": "/records"
    };
    return pathMap[text] || "/";
  }, [text]);

  // 카드 클릭 시 이동
  const handleClick = useCallback(() => {
    navigate(navigationPath);
  }, [navigate, navigationPath]);

  return (
    <div
      className={`${styles.card} ${isActive ? styles.active : styles.inactive} ${positionClass}`}
      onClick={handleClick}
    >
      <img src={image} alt={text} className={styles.image} loading="lazy" />
      <p className={styles.text}>{text}</p>
    </div>
  );
};

// React.memo로 불필요한 렌더링 방지
export default React.memo(Card);
