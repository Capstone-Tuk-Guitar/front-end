import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Card.module.css";

const Card = ({ image, text, isActive, position }) => {
  // 페이지 이동 함수
  const navigate = useNavigate();

  // 위치에 따른 클래스 추가
  let positionClass = "";

  if (position === -1) {
    positionClass = styles.left; // 왼쪽 카드
  } else if (position === 1) {
    positionClass = styles.right; // 오른쪽 카드
  } else if (position !== 0) {
    positionClass = styles.hidden; // 숨겨진 카드
  }

  // 카드 클릭 시 이동
  const handleClick = () => {
    if (text === "음원 목록") {
      navigate("/music");   // MusicPage로 이동
    } else if (text === "연주하기") {
      navigate("/practice");  // PracticePage로 이동
    } else if (text === "연주 기록") {
      navigate("/record");  // RecordPage로 이동
    }
  }

  return (
    <div
      className={`${styles.card} ${isActive ? styles.active : styles.inactive} ${positionClass}`}
      onClick={handleClick}
    >
      <img src={image} alt={text} className={styles.image} />
      <p className={styles.text}>{text}</p>
    </div>
  );
};

export default Card;
