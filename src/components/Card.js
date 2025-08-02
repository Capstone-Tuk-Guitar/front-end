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

  // 내비게이션 경로와 설명을 useMemo로 메모이제이션
  const cardInfo = useMemo(() => {
    const infoMap = {
      "음원 목록": {
        path: "/music",
        description: "다양한 기타 연주곡을\n추가하고 들어보세요",
        colorClass: styles.musicCard
      },
      "연주하기": {
        path: "/select_song",
        description: "선택한 곡을 따라하며\n기타 연주를 연습하세요",
        colorClass: styles.playCard
      },
      "비교하기": {
        path: "/accuracy",
        description: "연주한 곡을 원곡과 비교하여\n정확도를 확인하세요",
        colorClass: styles.compareCard
      },
      "연주 기록": {
        path: "/records",
        description: "비교한 기록을 확인하고\n녹음한 파일을 확인하세요",
        colorClass: styles.recordCard
      }
    };
    return infoMap[text] || { path: "/", description: "", colorClass: "" };
  }, [text]);

  // 카드 클릭 처리
  const handleClick = useCallback(() => {
    if (position === 0) {
      // 가운데 카드인 경우 부모 컴포넌트에 알린 후 바로 페이지 이동
      onCardClick?.(text, cardInfo.path, true); // 세 번째 인자로 즉시 이동 여부 전달
    } else {
      // 양옆 카드인 경우 부모 컴포넌트에 알림
      onCardClick?.(text, cardInfo.path, false);
    }
  }, [position, cardInfo.path, onCardClick, text]);

  return (
    <div
      className={`${styles.card} ${isActive ? styles.active : styles.inactive} ${positionClass} ${cardInfo.colorClass}`}
      onClick={handleClick}
    >
      <img src={image} alt={text} className={styles.image} loading="lazy" />
      <p className={styles.text}>{text}</p>
      <p className={styles.description}>{cardInfo.description}</p>
    </div>
  );
};

// React.memo로 불필요한 렌더링 방지
export default React.memo(Card);
