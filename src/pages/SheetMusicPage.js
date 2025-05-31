import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PracticeViewer from "../components/PracticeViewer";
import styles from "../styles/SheetMusicPage.module.css";

const SheetMusicPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const viewerRef = useRef(null);

  const [xmlFile, setXmlFile] = useState(null);
  const [song, setSong] = useState();
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    if (location.state?.fileUrl && location.state?.song) {
      setXmlFile(location.state.fileUrl);
      setSong(location.state.song);
      setAudioUrl(location.state.audioUrl);
      localStorage.setItem("xmlFile", location.state.fileUrl);
      localStorage.setItem("song", JSON.stringify(location.state.song));
      localStorage.setItem("audioUrl", location.state.audioUrl);
    } else {
      const savedFileUrl = localStorage.getItem("xmlFile");
      const savedSong = localStorage.getItem("song");
      const savedAudioUrl = localStorage.getItem("audioUrl");
      if (savedFileUrl && savedSong) {
        setXmlFile(savedFileUrl);
        setSong(JSON.parse(savedSong));
        setAudioUrl(savedAudioUrl);
      } else {
        alert("악보 정보가 없습니다. 다시 곡을 선택해주세요.");
        navigate("/select_song");
      }
    }
  }, [location, navigate]);

  return (
    <div className="container">
      <Header />
      <div className={styles.container}>
        <h2 className={styles.title}>{song?.title || "악보 보기"}</h2>
        <PracticeViewer ref={viewerRef} xmlFile={xmlFile} audioUrl={audioUrl} />
      </div>
    </div>
  );
};

export default SheetMusicPage;
