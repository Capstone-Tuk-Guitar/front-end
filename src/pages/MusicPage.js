import React, { useState, useEffect, useRef } from "react";
import { FaUpload } from "react-icons/fa";
import ControlPanel from "../components/ControlPanel";
import SongList from "../components/SongList";
import Header from "../components/Header";
import Button from "../components/Button";
import styles from "../styles/MusicPage.module.css";

const MusicPage = () => {
  const [selectedSong, setSelectedSong] = useState(null);
  const [songs, setSongs] = useState([]);                     // 업로드된 곡 목록
  const audioRef = useRef(new Audio());
  
  const outputType = "midi";
  const delay = 60000;                                        // 기본값: 1분 (60000ms)
  const [loadingSongs, setLoadingSongs] = useState({});
  
  // MP3 파일 업로드
  const handleFileUpload = async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".mp3";
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:8000/upload/", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error("Upload failed");
        const result = await response.json();
        setSongs((prev) => [...prev, {
          title: result.title,
          artist: "Unknown",
          difficulty: "Custom",
          filename: result.filename,
        }]);
      } catch (error) {
        console.error("Upload error:", error);
      }
    };
    fileInput.click();
  };

  // 서버에 업로드된 MP3 목록
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch("http://localhost:8000/songs/");
        if (!response.ok) throw new Error("Failed to fetch songs");
        const data = await response.json();
        setSongs(data);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };
    fetchSongs();
  }, []);

  // 곡 선택 시 재생 처리
  const handleSongSelect = async (song) => {
    setSelectedSong(song);
    if (audioRef.current) {
      audioRef.current.src = `http://localhost:8000/uploads/${encodeURIComponent(song.filename)}`;
      audioRef.current.play();
    }
  };

  // 곡 삭제
  const handleDelete = async (title) => {
    try {
      const response = await fetch(`http://localhost:8000/delete/?title=${encodeURIComponent(title)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      setSongs((prev) => prev.filter((song) => song.title !== title));
    } catch (error) {
      console.error("Error deleting song:", error);
    }
  };

  //get job_id + 다운로드
  const handleDownload = async (song) => {
    setLoadingSongs((prev) => ({ ...prev, [song.title]: true }));

    try {
      // MP3 파일을 fetch → File 객체 생성
      const fileRes = await fetch(`http://localhost:8000/uploads/${encodeURIComponent(song.filename)}`);
      const fileBlob = await fileRes.blob();
      const file = new File([fileBlob], song.filename, { type: "audio/mpeg" });

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
      console.log("변환 요청 완료 - job_id:", job_id);

      // 1분 대기 후 다운로드 시작
      setTimeout(() => {
        startDownloadPolling(job_id, song.title, outputType);
        setLoadingSongs((prev) => ({ ...prev, [song.title]: false }));
      },delay);
    } catch (err) {
      console.error("다운로드 요청 실패:", err);
      alert("변환 요청에 실패했습니다.");
      setLoadingSongs((prev) => ({ ...prev, [song.title]: false }));
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
          link.download = `${title}.${type}`;
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
      
      <div className={styles.container}>
        <ControlPanel selectedSong={selectedSong} audioRef={audioRef} />
        <SongList
          songs={songs}
          onSongSelect={handleSongSelect}
          onDownload={handleDownload}
          onDelete={handleDelete}
          showDelete={true}
          loadingSongs={loadingSongs}
        />
      </div>
      <Button className={styles.uploadButton} onClick={handleFileUpload} icon={FaUpload}>
        음원 추가
      </Button>
      <audio ref={audioRef} />
    </div>
  );
};

export default MusicPage;
