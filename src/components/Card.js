import React, { useCallback, useMemo } from "react";
import styles from "../styles/Card.module.css";

const Card = ({ image, text, isActive, position, onCardClick }) => {

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

  // 카드 클릭 처리
  const handleClick = useCallback(() => {
    if (position === 0) {
      // 가운데 카드인 경우 부모 컴포넌트에 알린 후 바로 페이지 이동
      onCardClick?.(text, navigationPath, true); // 세 번째 인자로 즉시 이동 여부 전달
    } else {
      // 양옆 카드인 경우 부모 컴포넌트에 알림
      onCardClick?.(text, navigationPath, false);
    }
  }, [position, navigationPath, onCardClick, text]);

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
