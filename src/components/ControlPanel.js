import React from "react";
import styles from "../styles/ControlPanel.module.css";

import panelImage from "../assets/record.svg";
import playImage from "../assets/play.svg";
import pauseImage from "../assets/pause.svg";
import stopImage from "../assets/stop.svg";

const ControlPanel = ({ selectedSong, audioRef, className = '', id }) => {
  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className={`${styles.panel} ${className}`} id={id}>
      <img src={panelImage} alt="controlpanel" className={styles.panelImage} />
      <p className={styles.placeholder}>
        {selectedSong ? (
          <>
            <h3 className={styles.songTitle}>{selectedSong.title}</h3>
            <p className={styles.songArtist}>{selectedSong.artist}</p>
            <div className={styles.buttons}>
              <img src={playImage} onClick={handlePlay} className={styles.button} alt="재생" />
              <img src={pauseImage} onClick={handlePause} className={styles.button} alt="일시정지" />
              <img src={stopImage} onClick={handleReset} className={styles.button} alt="정지" />
            </div>
          </>
        ) : "곡을 선택하세요" }
      </p>
    </div>
  );
};

export default ControlPanel;
