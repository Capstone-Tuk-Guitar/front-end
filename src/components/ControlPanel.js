import React from "react";
import styles from "../styles/ControlPanel.module.css";

const ControlPanel = ({ selectedSong }) => {
  const handlePlay = () => {
    alert("재생");
  };

  const handlePause = () => {
    alert("일시 정지");
  };

  const handleReset = () => {
    alert("정지");
  };

  return (
    <div className={styles.panel}>
      {selectedSong ? (
        <>
          <h3 className={styles.songTitle}>{selectedSong.title}</h3>
          <p className={styles.songArtist}>{selectedSong.artist}</p>
          <div className={styles.buttons}>
            <button onClick={handlePlay} className={styles.button}>
              재생
            </button>
            <button onClick={handlePause} className={styles.button}>
              일시 정지
            </button>
            <button onClick={handleReset} className={styles.button}>
              정지
            </button>
          </div>
        </>
      ) : (
        <p className={styles.placeholder}>곡을 선택하세요</p>
      )}
    </div>
  );
};

export default ControlPanel;
