import React from "react";
import Song from "./Song";
import styles from "../styles/SongList.module.css";

const SongList = ({
  songs = [],
  onSongSelect,
  onDownload,
  onDelete,
  showDelete = true,
  loadingSongs = {},
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
            onDownload={onDownload}
            onDelete={onDelete}
            showDelete={showDelete}
            loading={loadingSongs[song.title] || false}
          />
        ))
      )}
    </div>
  );
};

export default SongList;