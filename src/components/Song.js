import React from "react";
import styles from "../styles/Song.module.css";

const Song = ({
  song,
  onSongSelect,
  onDelete,
  onDownloadPDF,
  onDownloadGP5,
  showDownloadPDF = true,
  showDownloadGP5 = true,
}) => {
  const handleClick = () => {
    onSongSelect?.(song);
  };

  return (
    <div className={styles.songCard}>
      <div className={styles.songInfo} onClick={handleClick}>
        <h3>{song.title}</h3>
      </div>

      <div className={styles.infoContainer}>
        <span>{song.difficulty}</span>

        {showDownloadPDF && (
          <button className={styles.sheetButton} onClick={() => onDownloadPDF(song)}>
            PDF[MIDI] 다운로드
          </button>
        )}
        {showDownloadGP5 && (
          <button className={styles.sheetButton} onClick={() => onDownloadGP5(song)}>
            GP5 다운로드
          </button>
        )}
        <button className={styles.deleteButton} onClick={() => onDelete(song.title)}>
          삭제
        </button>
      </div>
    </div>
  );
};

export default Song;
