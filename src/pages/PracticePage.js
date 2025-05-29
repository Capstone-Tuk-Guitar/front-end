import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PracticeViewer from "../components/PracticeViewer";
import Playing from "../components/Playing";
import ChordGuide from "../components/ChordGuide";
import styles from "../styles/PracticePage.module.css";

function PracticePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [xmlFile, setXmlFile] = useState(null);
  const [song, setSong] = useState();
  const [audioUrl, setAudioUrl] = useState(null);
  const [chordTimeline, setChordTimeline] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    if (location.state?.fileUrl && location.state?.song) {
      setXmlFile(location.state.fileUrl);
      setSong(location.state.song);
      setAudioUrl(location.state.audioUrl);
      if (location.state.chordTimeline) {
        setChordTimeline(location.state.chordTimeline);
      }
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
        <audio ref={audioRef} src={audioUrl} />
        <ChordGuide chordTimeline={chordTimeline} />
        <Playing chordTimeline={chordTimeline} audioRef={audioRef} />
      </div>
    </div>
  );
}

export default PracticePage;

