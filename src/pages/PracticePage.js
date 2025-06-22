import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ChordGuide from "../components/ChordGuide";
import PracticeViewer from "../components/PracticeViewer";
import Playing from "../components/Playing";
import styles from "../styles/PracticePage.module.css";

function PracticePage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const viewerRef = useRef(null);
  const playingRef = useRef(null);
  const audioRef = useRef(new Audio());
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const isUploading = useRef(false);

  const [xmlFile, setXmlFile] = useState(null);
  const [, setSong] = useState();
  const [audioUrl, setAudioUrl] = useState(null);
  const [chordTimeline, setChordTimeline] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

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

  useEffect(() => {
    if (audioUrl) {
      audioRef.current.src = audioUrl;
    }
  }, [audioUrl]);

  const handlePlay = () => {
    if (viewerRef.current && viewerRef.current.play) {
      viewerRef.current.play();
    }
    if (playingRef.current && playingRef.current.start) {
      playingRef.current.start();
    }
    audioRef.current.play();
    setIsPlaying(true);
  };

  const handleStop = () => {
    if (viewerRef.current && viewerRef.current.stop) {
      viewerRef.current.stop();
    }
    if (playingRef.current && playingRef.current.stop) {
      playingRef.current.stop();
    }
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setRecordedChunks([]);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        console.log("녹음 종료됨");
      };

      recorder.start();
      setIsRecording(true);
      handlePlay();
    } catch (err) {
      alert("녹음을 시작할 수 없습니다: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      handleStop();
    }
  };

  const uploadRecording = async () => {
    if (isUploading.current) return;

    if (recordedChunks.length === 0) {
      alert("저장할 녹음이 없습니다.");
      return;
    }

    const blob = new Blob(recordedChunks, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("file", blob, "recorded_audio.webm");

    isUploading.current = true;

    try {
      const res = await fetch("http://localhost:8000/record/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("업로드 실패");
      alert("녹음 저장 완료!");
    } catch (err) {
      alert("업로드 실패: " + err.message);
    } finally {
      isUploading.current = false;
    }
  };

  return (
    <div className="container">
      <Header />
      <div className={styles.container}>
        <ChordGuide chordTimeline={chordTimeline} />
        <PracticeViewer ref={viewerRef} xmlFile={xmlFile} audioRef={audioRef} />
        <Playing ref={playingRef} chordTimeline={chordTimeline} audioRef={audioRef} />
        
        <div className={styles.controlButtons}>
          {!isRecording ? (
            <button onClick={startRecording} className={styles.controlButton} disabled={isPlaying}>
              🎙️ 녹음 시작
            </button>
          ) : (
            <button onClick={stopRecording} className={styles.controlButton}>
              ⏹️ 녹음 정지
            </button>
          )}
          <button 
            onClick={uploadRecording} 
            className={styles.controlButton}
            disabled={isRecording || recordedChunks.length === 0 || isPlaying}
          >
            💾 녹음 저장
          </button>
          <button onClick={handlePlay} disabled={isPlaying || isRecording} className={styles.controlButton}>
            재생
          </button>
          <button onClick={handleStop} disabled={!isPlaying || isRecording} className={styles.controlButton}>
            정지
          </button>
        </div>
      </div>
    </div>
  );
}

export default PracticePage;

