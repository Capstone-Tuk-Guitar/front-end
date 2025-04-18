import React from "react";
import Song from "./Song";
import styles from "../styles/SongList.module.css";

const SongList = ({
  songs = [],
  onSongSelect,
  onDelete,
  onDownloadPDF,
  onDownloadGP5,
  showDownloadPDF = true,
  showDownloadGP5 = true,
}) => {
  return (
    <div className={styles.songListContainer}>
      {songs.length === 0 ? (
        <p className={styles.emptyMessage}>아직 업로드한 곡이 없습니다 🎶</p>
      ) : (
        songs.map((song, index) => (
          <Song
            key={`${song.title}-${index}`}
            song={song}
            onSongSelect={onSongSelect}
            onDelete={onDelete}
            onDownloadPDF={onDownloadPDF}
            onDownloadGP5={onDownloadGP5}
            showDownloadPDF={showDownloadPDF}
            showDownloadGP5={showDownloadGP5}
          />
        ))
      )}
    </div>
  );
};

export default SongList;