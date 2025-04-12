import React, { useState, useEffect, useRef } from "react";
import { FaUpload } from "react-icons/fa";
import ControlPanel from "../components/ControlPanel";
import SongList from "../components/SongList";
import Header from "../components/Header";
import Button from "../components/Button";
import styles from "../styles/MusicPage.module.css";

const MusicPage = () => {
  //음악재생 및 음원목록
  const [selectedSong, setSelectedSong] = useState(null);
  const [songs, setSongs] = useState([]);
  const audioRef = useRef(new Audio());

  //악보 다운
  const [, setSelectedSongTitle] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [outputType] = useState("pdf");       // midi로 변경 시 midi 파일 다운로드

  //서버에서 파일 목록 가져오기
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

  //노래 선택 시 재생
  const handleSongSelect = async(song) => {
    setSelectedSong(song);
    setSelectedSongTitle(song);
    if (audioRef.current) {
      audioRef.current.src = `http://localhost:8000/uploads/${encodeURIComponent(song.filename)}`;
      audioRef.current.play();
    }
  };

  //파일 업로드
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
        setSongs((prevSongs) => [...prevSongs, { title: result.title, artist: "Unknown", difficulty: "Custom", filename: result.filename }]);
      } catch (error) {
        console.error("Upload error:", error);
      }
    };
    fileInput.click();
  };

  //파일 삭제
  const handleDelete = async (title) => {
    try {
      const response = await fetch(`http://localhost:8000/delete/?title=${encodeURIComponent(title)}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      // 삭제 후 리스트에서 제거
      setSongs((prevSongs) => prevSongs.filter((song) => song.title !== title));
    } catch (error) {
      console.error("Error deleting song:", error);
    }
  };

  //get job_id 
  const handleSheetUpload = async (song) => {
    if (!song || !song.filename) {
      alert("파일을 선택하세요.");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8000/uploads/${encodeURIComponent(song.filename)}`);
      const blob = await response.blob();
      const newFile = new File([blob], song.filename, { type: "audio/mpeg" });
  
      const formData = new FormData();
      formData.append("file", newFile);
      formData.append("model", "guitar");
      formData.append("title", song.title);
      formData.append("composer", "Unknown");
      formData.append("outputs", "pdf,midi");
  
      const uploadResponse = await fetch("http://127.0.0.1:8000/convert/transcription/", {
        method: "POST",
        body: formData,
      });
  
      if (!uploadResponse.ok) {
        throw new Error(`서버 오류: ${uploadResponse.status}`);
      }
  
      const result = await uploadResponse.json();
      console.log("Job ID:", result.job_id);
      setJobId(result.job_id);
    } catch (error) {
      console.error("Error:", error);
      alert("파일 업로드 실패!");
    }
  };
  
  //pdf 다운
  const handleSheetDownload = async () => {
    if (!jobId) {
      alert("먼저 파일을 업로드하세요.");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/convert/download/${jobId}/${outputType}`);

      if (!response.ok) {
        throw new Error("파일 다운로드 실패");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${jobId}.${outputType}`;//`${selectedSongTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      alert("파일 다운로드 완료!");
    } catch (error) {
      console.error("Download Error:", error);
      alert("파일 다운로드 실패!");
    }
  };

  return (
    <div className="container">
      <Header />
      
      <div className={styles.container}>
          <ControlPanel selectedSong={selectedSong} audioRef={audioRef} />
          <SongList songs={songs} onSongSelect={handleSongSelect} onDelete={handleDelete} 
          onSheetUpload={handleSheetUpload} onSheetDownload={handleSheetDownload}/>
      </div>

      <Button className={styles.uploadButton} onClick={handleFileUpload} icon={FaUpload}>
        음원 추가
      </Button>
      
      <audio ref={audioRef} />
    </div>
  );
};

export default MusicPage;
