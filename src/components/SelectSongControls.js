import React from "react";
import styles from "../styles/SelectSongPage.module.css";

import playImage from "../assets/play.svg";
import pauseImage from "../assets/pause.svg";
import panelImage from "../assets/record.svg";

const SelectSongControls = ({ isPlaying, onPlay, onPause, onPractice }) => (
  <div className={styles.controlContainer}>
    {isPlaying ? (
      <img src={pauseImage} onClick={onPause} className={styles.button} alt="일시정지" />
    ) : (
      <img src={playImage} onClick={onPlay} className={styles.button} alt="재생" />
    )}
    <div className={styles.sheetContainer} onClick={onPractice}>
      <img src={panelImage} alt="연습 이동" className={styles.img} />
    </div>
  </div>
);

export default SelectSongControls; 