import React from "react";
import Song from "./Song";
import styles from "../styles/SongList.module.css";

const SongList = ({
  songs = [],
  onSongSelect,
  onDownload,
  onDelete,
  showDownload = true,
  showDelete = true,
  loadingSongs = {},
  className = '',
  id,
}) => {
  return (
    <div className={`${styles.songListContainer} ${className}`} id={id}>
      {songs.length === 0 ? (
        <p className={styles.emptyMessage}>아직 업로드한 곡이 없습니다 🎶</p>
      ) : (
        songs.map((song) => (
          <Song
            key={song.music_id}
            song={song}
            onSongSelect={onSongSelect}
            onDownload={onDownload}
            onDelete={onDelete}
            showDownload={showDownload}
            showDelete={showDelete}
            loading={loadingSongs[song.music_id] || false}
          />
        ))
      )}
    </div>
  );
};

export default SongList;