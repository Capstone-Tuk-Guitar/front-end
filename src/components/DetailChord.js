import React from "react";
import styles from "../styles/DetailChord.module.css";

const DetailChord = ({ chordImage, onClose }) => {
  if (!chordImage) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ✖
        </button>
        <h2 className={styles.title}>운지법</h2>
        <img src={chordImage} alt="Chord Fingering" className={styles.chordImage} />
      </div>
    </div>
  );
};

export default DetailChord;