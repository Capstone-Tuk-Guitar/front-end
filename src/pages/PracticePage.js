import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PracticeViewer from "../components/PracticeViewer";
import Playing from "../components/Playing";
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

  useEffect(() => {
    if (!song) return;
    const fetchChords = async () => {
      try {
        const res = await fetch(`http://localhost:8000/xml_info/${song.music_id}`);
        const data = await res.json();
        setChordTimeline(data.chords || []); // chords 초기화
      } catch (err) {
        console.error("코드 타이밍 불러오기 실패", err);
        setChordTimeline([]);
      }
    };
    fetchChords();
  }, [song]);

  return (
    <div className="container">
      <Header />
      <div className={styles.container}>
        <PracticeViewer xmlFile={xmlFile} audioUrl={audioUrl} />
        <audio ref={audioRef} src={audioUrl} controls autoPlay />
        {chordTimeline.length > 0 && (
          <Playing chordTimeline={chordTimeline} audioRef={audioRef} />
        )}
      </div>
    </div>
  );
}

export default PracticePage;

