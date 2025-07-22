import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ChordGuide from "../components/ChordGuide";
import PracticeViewer from "../components/PracticeViewer";
import Playing from "../components/Playing";
import styles from "../styles/PracticePage.module.css";
import { FaQuestionCircle } from "react-icons/fa";
import { useTour, TourOverlay } from "../components/TourHelper";

function PracticePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const viewerRef = useRef(null);
  const playingRef = useRef(null);
  const fingeringRef = useRef(null);
  const recordBtnRef = useRef(null);
  const playBtnRef = useRef(null);
  const stopBtnRef = useRef(null);

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

  const tourSteps = [
    {
      target: "fingering",
      title: "운지법 보기",
      description: "해당 노래 안에 있는 모든 운지법 표시합니다. 클릭하면 더 큰 화면으로 볼 수 있습니다.",
      top: 160
    },
    {
      target: "viewer",
      title: "악보 보기",
      description: "연주하고 있는 노래의 악보를 확인할 수 있습니다. 빨간 커서로 실시간 악보 위치를 확인할 수 있습니다.",
      top: -350
    },
    {
      target: "playing",
      title: "연주 타이밍 화면",
      description: "리듬게임처럼 가운데 선에 들어오는 운지법을 보고 쳐서 맞으면 초록, 틀리면 빨강으로 표시됩니다.",
      top: -280
    },
    {
      target: "recordGroup",
      title: "녹음 및 저장",
      description: "연주와 동시에 녹음을 하는 기능입니다. 재생 버튼을 누르지 않고 녹음 시작 버튼을 눌러도 연주가 시작됩니다. 연주가 끝나면 녹음 저장 버튼을 누르시면 됩니다.",
      top: -315,
    },
    {
      target: "playGroup",
      title: "재생 및 정지",
      description: "재생 버튼은 녹음하지 않고 연주를 시작합니다. 녹음을 하시려면 정지 버튼을 눌러 멈추고 녹음 시작 버튼을 누르시면 됩니다.",
      top: -290,
    },
  ];

  const {
    isTourActive,
    tourStep,
    tooltipPosition,
    startTour,
    nextTourStep,
    prevTourStep,
    endTour,
    getHighlightClass,
    moveToStep,
  } = useTour(tourSteps);

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
      <div className={styles.helpButtonContainer}>
          <button className={styles.helpButton} onClick={startTour}>
            <FaQuestionCircle style={{ marginRight: "8px" }}/> 도움말
          </button>
        </div>
      <div className={styles.container}>
        <div
          id="fingering"
          ref={fingeringRef}
          className={getHighlightClass("fingering")}
        >
          <ChordGuide ref={fingeringRef} chordTimeline={chordTimeline} />
        </div>

        <div
          id="viewer"
          ref={viewerRef}
          className={getHighlightClass("viewer")}
        >
          <PracticeViewer ref={viewerRef} xmlFile={xmlFile} audioRef={audioRef} />
        </div>

        <div
          id="playing"
          ref={playingRef}
          className={getHighlightClass("playing")}
        >
          <Playing ref={playingRef} chordTimeline={chordTimeline} audioRef={audioRef} />
        </div>

        <div className={styles.controlButtons}>
        {/* 녹음 그룹 */}
        <div
          id="recordGroup"
          className={getHighlightClass("recordGroup")}
          style={{ display: "flex", gap: "10px" }}
        >
          <button
            id="recordBtn"
            ref={recordBtnRef}
            onClick={isRecording ? stopRecording : startRecording}
            className={styles.controlButton}
            disabled={isPlaying}
          >
            {isRecording ? "⏹️ 녹음 정지" : "🎙️ 녹음 시작"}
          </button>

          <button
            id="uploadBtn"
            onClick={uploadRecording}
            className={styles.controlButton}
            disabled={isRecording || recordedChunks.length === 0 || isPlaying}
          >
            💾 녹음 저장
          </button>
        </div>

        {/* 재생 그룹 */}
        <div
          id="playGroup"
          className={getHighlightClass("playGroup")}
          style={{ display: "flex", gap: "10px" }}
        >
          <button
            id="playBtn"
            ref={playBtnRef}
            onClick={handlePlay}
            className={styles.controlButton}
            disabled={isPlaying || isRecording}
          >
            재생
          </button>

          <button
            id="stopBtn"
            ref={stopBtnRef}
            onClick={handleStop}
            className={styles.controlButton}
            disabled={!isPlaying || isRecording}
          >
            정지
          </button>
        </div>
      </div>

      </div>
      <TourOverlay
        isTourActive={isTourActive}
        tourStep={tourStep}
        tooltipPosition={tooltipPosition}
        tourSteps={tourSteps}
        endTour={endTour}
        prevTourStep={prevTourStep}
        nextTourStep={nextTourStep}
        moveToStep={moveToStep}
      />
    </div>
  );
}

export default PracticePage;
