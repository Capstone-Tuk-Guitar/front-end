import React from "react";
import styles from "../styles/Song.module.css";

const Song = ({
  song,
  onSongSelect,
  onDownload,
  onDelete,
  showDelete = true,
  loading = false,
}) => {
  const handleClick = () => {
    onSongSelect?.(song);
  };

  return (
    <div className={styles.songCard}>
      <div className={styles.songInfo} onClick={handleClick}>
        <h3>{song.title}</h3>
      </div>

      <div className={styles.buttonContainer}>
        <button
          className={styles.sheetButton}
          onClick={() => onDownload(song)}
          disabled={loading}
        >
          {loading ? "다운로드 중..." : "♬ 악보 다운로드"}
        </button>

        {showDelete && (
          <button
            className={styles.deleteButton}
            onClick={() => onDelete(song.music_id)}>
            삭제
          </button>
        )}
      </div>
    </div>
  );
};

export default Song;
