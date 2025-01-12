import React from 'react';
import styles from '../styles/Card.module.css'; // CSS Module을 사용한 스타일링

function Card({ title, icon, onClick, color }) {
  return (
    <div
      className={styles.card}
      style={{ borderColor: color }}
      onClick={onClick}
    >
      <img src={icon} alt={`${title} icon`} className={styles.icon} />
      <p className={styles.title}>{title}</p>
    </div>
  );
}

export default Card;
