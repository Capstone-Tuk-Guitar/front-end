import React, { useState } from "react";
import ControlPanel from "../components/ControlPanel";
import SongList from "../components/SongList";
import styles from "../styles/MusicPage.module.css";

const MusicPage = () => {
  const [selectedSong, setSelectedSong] = useState(null);

  const handleSongSelect = (song) => {
    setSelectedSong(song);
  };

  return (
    <div className="container">
        <div className={styles.container}>
            {/* 왼쪽: 컨트롤 패널 */}
            <ControlPanel selectedSong={selectedSong} />

            {/* 중앙: 곡 리스트 */}
            <SongList onSongSelect={handleSongSelect} />

        </div>
    
        <button>음원 추가</button>
    </div>
  );
};

export default MusicPage;
