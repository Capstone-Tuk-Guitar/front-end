import React from "react";
import Song from "./Song";
import styles from "../styles/SongList.module.css";

const SongList = ({ songs = [], onSongSelect, onDelete,onSheetUpload, onSheetDownload }) => {
  const handleSongClick = async (song) => {
    await onSheetUpload(song); // 선택한 곡으로 악보 변환 요청
    onSongSelect(song); // 선택한 곡 재생
  };

  return (
    <div className={styles.songListContainer}>
      {songs.map((song, index) => (
        <Song
          key={song.title + index}
          song={song}
          onSongSelect={onSongSelect}
          onDelete={onDelete}
          onSheetUpload={onSheetUpload}
          onSheetDownload={onSheetDownload}
        />
      ))}
    </div>
  );
};

export default SongList;