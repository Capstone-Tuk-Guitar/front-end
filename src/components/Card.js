import React from "react";
import styles from "../styles/Card.module.css";

const Card = ({ image, text }) => {
  return (
    <div className={styles.card}>
      <img src={image} alt={text} className={styles.image} />
      <p className={styles.text}>{text}</p>
    </div>
  );
};

export default Card;
