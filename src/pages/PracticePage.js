import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PracticeViewer from "../components/PracticeViewer";
import styles from "../styles/PracticePage.module.css";

function PracticePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [gp5File, setGp5File] = useState(null);
  const [song, setSong] = useState();

  useEffect(() => {
    if (location.state?.fileUrl && location.state?.song) {
      setGp5File(location.state.fileUrl);
      setSong(location.state.song);
      localStorage.setItem("gp5File", location.state.fileUrl);
      localStorage.setItem("song", JSON.stringify(location.state.song));
    } else {
      const savedFileUrl = localStorage.getItem("gp5File");
      const savedSong = localStorage.getItem("song");
      if (savedFileUrl && savedSong) {
        setGp5File(savedFileUrl);
        setSong(JSON.parse(savedSong));
      } else {
        alert("악보 정보가 없습니다. 다시 곡을 선택해주세요.");
        navigate("/select_song");
      }
    }
  }, [location, navigate]);

  const handleClick = () => {
    navigate("/accuracy");
  };

  return (
    <div className="container">
      <Header />

      <div className={styles.container} >
        <PracticeViewer gp5File={gp5File} />
        <br />
        <button onClick={handleClick}>MIDI 파일 비교하기</button>
      </div>
    </div>
  );
}

export default PracticePage;
