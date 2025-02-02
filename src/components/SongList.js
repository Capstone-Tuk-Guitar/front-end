import React from "react";
import styles from "../styles/SongList.module.css";

const SongList = ({ onSongSelect }) => {
  const songs = [
    { title: "Dark Eyes", artist: "Rusty K & Mir", difficulty: "4★" },
    { title: "Altros", artist: "Altrossf / Shin", difficulty: "5★" },
    { title: "GHOST", artist: "Camellia / Arbanne", difficulty: "6★" },
  ];

  return (
    <div className={styles.songListContainer}>
      {songs.map((song, index) => (
        <div
          key={index}
          className={styles.songCard}
          onClick={() => onSongSelect(song)} // 곡 선택 이벤트
        >
          <h3>{song.title}</h3>
          <p>{song.artist}</p>
          <span>{song.difficulty}</span>
        </div>
      ))}
    </div>
  );
};

export default SongList;
