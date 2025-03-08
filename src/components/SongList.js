import React from "react";
import Song from "./Song";
import styles from "../styles/SongList.module.css";

const SongList = ({ songs = [], onSongSelect, onDelete,onSheetUpload, onSheetDownload }) => {
  
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