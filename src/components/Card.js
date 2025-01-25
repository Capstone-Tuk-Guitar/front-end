import React from "react";
import styles from "../styles/Card.module.css";

const Card = ({ image, text, isActive, position }) => {
  // 위치에 따른 클래스 추가
  let positionClass = "";

  if (position === -1) {
    positionClass = styles.left; // 왼쪽 카드
  } else if (position === 1) {
    positionClass = styles.right; // 오른쪽 카드
  } else if (position !== 0) {
    positionClass = styles.hidden; // 숨겨진 카드
  }

  return (
    <div
      className={`${styles.card} ${isActive ? styles.active : styles.inactive} ${positionClass}`}
    >
      <img src={image} alt={text} className={styles.image} />
      <p className={styles.text}>{text}</p>
    </div>
  );
};

export default Card;
