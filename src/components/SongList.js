import React from "react";
import styles from "../styles/SongList.module.css";

const SongList = ({ songs = [], onSongSelect, onDelete,onSheetUpload, onSheetDownload }) => {
  const handleSongClick = async (song) => {
    await onSheetUpload(song); // 선택한 곡으로 악보 변환 요청
    onSongSelect(song); // 선택한 곡 재생
  };
  return (
    <div className={styles.songListContainer}>
      {songs.map((song, index) => (
        <div key={index} className={styles.songCard}>
          <div className={styles.songInfo} onClick={() => handleSongClick(song)} >
            <h3>{song.title}</h3>
            <p>{song.artist}</p>
          </div>
          <div className={styles.infoContainer}>
            <span>{song.difficulty}</span>
            <button className={styles.sheetButton} onClick={() => onSheetDownload()}>♬악보 다운로드</button>
            <button className={styles.deleteButton} onClick={() => onDelete(song.title)}>삭제</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SongList;