import React, { useState, useEffect, useRef } from "react";
import { FaUpload, FaQuestionCircle } from "react-icons/fa";
import ControlPanel from "../components/ControlPanel";
import SongList from "../components/SongList";
import Header from "../components/Header";
import Button from "../components/Button";
import { useTour, TourOverlay } from "../components/TourHelper";
import styles from "../styles/MusicPage.module.css";

const MusicPage = () => {
  const [selectedSong, setSelectedSong] = useState(null);
  const [songs, setSongs] = useState([]);                     // 업로드된 곡 목록
  const audioRef = useRef(new Audio());
  
  const outputType = "pdf";
  const downloadType = "pdf"; 
  const delay = 60000;                                        // klangio api 대기 시간 (1분)
  const [loadingSongs, setLoadingSongs] = useState({});

  // 투어 단계별 정보
  const tourSteps = [
    {
      target: 'controlPanel',
      title: '음악 컨트롤',
      description: '선택한 음악을 재생, 일시정지, 정지할 수 있습니다.',
      top: -250
    },
    {
      target: 'songList',
      title: '음악 목록',
      description: '업로드한 음악들을 확인하고 \n 악보로 변환하거나 삭제할 수 있습니다.',
      top: -280
    },
    {
      target: 'uploadButton',
      title: '음원 추가',
      description: 'MP3 파일을 업로드하여 \n 새로운 음악을 추가할 수 있습니다.',
      top: -275
    }
  ];

  // 도움말 투어 훅 사용
  const {
    isTourActive,
    tourStep,
    tooltipPosition,
    startTour,
    nextTourStep,
    prevTourStep,
    endTour,
    getHighlightClass
  } = useTour(tourSteps);

  const username = localStorage.getItem("user_id");

  // 서버에 업로드된 MP3 목록
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch(`http://localhost:8000/music/${username}`);
        if (!response.ok) throw new Error("Failed to fetch songs");
        const data = await response.json();
        setSongs(data);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };
    fetchSongs();
  }, [username]);

  // MP3 파일 업로드
  const handleFileUpload = async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".mp3";
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("user_id", username);
      formData.append("title", file.name);
      formData.append("composer", "Unknown");
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:8000/upload-music/", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error("Upload failed");
        const result = await response.json();
        setSongs(
          (prev) => [...prev, {
            music_id: result.music_id,
            title: result.title,
            artist: "Unknown",
            filename: result.filename,
          }]
        );
      } catch (error) {
        console.error("Upload error:", error);
      }
    };
    fileInput.click();
  };

  // 곡 선택 시 재생 처리
  const handleSongSelect = (song) => {
    setSelectedSong(song);
    if (audioRef.current) {
      audioRef.current.src = `http://localhost:8000/stream-music/${song.music_id}`;
      audioRef.current.play();
    }
  };

  // 곡 삭제
  const handleDelete = async (music_id) => {
    try {
      const response = await fetch(`http://localhost:8000/delete-music/?music_id=${music_id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      setSongs((prev) => prev.filter((song) => song.music_id !== music_id));
    } catch (error) {
      console.error("Error deleting song:", error);
    }
  };

  //get job_id + 다운로드
  const handleDownload = async (song) => {
    setLoadingSongs((prev) => ({ ...prev, [song.music_id]: true }));

    try {
      // MP3 파일을 fetch → File 객체 생성
      const fileRes = await fetch(`http://localhost:8000/stream-music/${song.music_id}`);
      const fileBlob = await fileRes.blob();
      const file = new File([fileBlob], `${song.title}.mp3`, { type: "audio/mpeg" });

      // 변환 요청 보내기
      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", "guitar");
      formData.append("title", song.title);
      formData.append("composer", song.artist || "Unknown");
      formData.append("outputs", outputType);

      const res = await fetch("http://localhost:8000/convert/transcription/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Transcription failed");
      const { job_id } = await res.json();
      console.log("job_id:", job_id);

      // 1분 대기 후 다운로드 시작
      setTimeout(() => {
        startDownloadPolling(job_id, song.title, downloadType);
        setLoadingSongs((prev) => ({ ...prev, [song.music_id]: false }));
      },delay);
    } catch (err) {
      console.error("다운로드 요청 실패:", err);
      alert("변환 요청에 실패했습니다.");
      setLoadingSongs((prev) => ({ ...prev, [song.music_id]: false }));
    }
  };

  // 다운로드 요청
  const startDownloadPolling = (jobId, title, type) => {
    let attempts = 0;
    const maxAttempts = 3;
    let downloaded = false;

    const poll = setInterval(async () => {
      if (downloaded || attempts >= maxAttempts) {
        clearInterval(poll);
        if (!downloaded) alert("파일 다운로드에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      attempts++;
      try {
        const res = await fetch(`http://localhost:8000/convert/download/${jobId}/${type}`);
        if (res.status === 200) {
          downloaded = true;
          const blob = await res.blob();
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          const cleanTitle = title.replace(/\.mp3$/i, "");
          link.download = `${cleanTitle}.${type}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (err) {
        console.warn(`다운로드 시도 실패 (${attempts}회):`, err);
      }
    }, 3000);
  };

  return (
    <div className="container">
      <Header />
      
      <div className={styles.helpButtonContainer}>
        <Button className={styles.helpButton} onClick={startTour} icon={FaQuestionCircle}>
          도움말
        </Button>
      </div>
      
      <div className={styles.container}>
        <ControlPanel 
          selectedSong={selectedSong} 
          audioRef={audioRef}
          className={getHighlightClass('controlPanel')}
          id="controlPanel"
        />
        <SongList
          songs={songs}
          onSongSelect={handleSongSelect}
          onDownload={handleDownload}
          onDelete={handleDelete}
          loadingSongs={loadingSongs}
          className={getHighlightClass('songList')}
          id="songList"
        />
      </div>
      <div className={styles.emptyArea}></div>
      <div id="uploadButton" className={getHighlightClass('uploadButton')}>
        <Button className={styles.uploadButton} onClick={handleFileUpload} icon={FaUpload}>
          음원 추가
        </Button>
      </div>
      
      {/* 투어 오버레이 */}
      <TourOverlay
        isTourActive={isTourActive}
        tourStep={tourStep}
        tooltipPosition={tooltipPosition}
        tourSteps={tourSteps}
        endTour={endTour}
        prevTourStep={prevTourStep}
        nextTourStep={nextTourStep}
      />
      <audio ref={audioRef} />
    </div>
  );
};

export default MusicPage;
