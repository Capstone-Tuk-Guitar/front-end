import React from "react";
import styles from "../styles/Card.module.css";

const Card = ({ image, text, isActive, position }) => {
  return (
    <div
      className={`${styles.card} ${isActive ? styles.active : ""}`}
      style={{
        transform: `scale(${isActive ? 1 : 0.8}) translateX(${position * 70}%)`,
        zIndex: isActive ? 2 : 1,
        opacity: isActive ? 1 : 0.5,
      }}
    >
      <img src={image} alt={text} className={styles.image} />
      <p className={styles.text}>{text}</p>
    </div>
  );
};

export default Card;
