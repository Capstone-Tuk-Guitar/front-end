import React, { useState, useEffect, useRef } from "react";
import { FaUpload } from "react-icons/fa";
import axios from "axios";
import ControlPanel from "../components/ControlPanel";
import SongList from "../components/SongList";
import Header from "../components/Header";
import Button from "../components/Button";
import styles from "../styles/MusicPage.module.css";


const MusicPage = () => {
  const [selectedSong, setSelectedSong] = useState(null);
  const [songs, setSongs] = useState([]);
  const audioRef = useRef(new Audio());

  const [jobId, setJobId] = useState(null);
  const [outputType] = useState("pdf");

  const userId = localStorage.getItem("user_id");

  // 🎵 내 음악 불러오기
  const fetchSongs = async () => {
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8000/music/${userId}`);
      setSongs(response.data);
    } catch (error) {
      console.error("음원 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);
  
  const handleSongSelect = async (song) => {
    console.log("🎵 선택된 song 객체:", song);
    console.log("🎵 재생 URL:", song.file_url);
  
    setSelectedSong(song);
  
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = encodeURI(song.file_url);  
      audioRef.current.load();
      audioRef.current.play().catch((e) => {
        console.error("🎧 재생 실패:", e);
      });
    }
  };
  
  
  

  const handleFileUpload = async () => {
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".mp3";
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("title", file.name.replace(".mp3", ""));
      formData.append("composer", "Unknown");
      formData.append("file", file);

      try {
        const response = await axios.post("http://localhost:8000/upload-music/", formData);
        alert("업로드 완료!");
        fetchSongs(); // 목록 갱신
      } catch (error) {
        console.error("업로드 에러:", error);
        alert("업로드 실패!");
      }
    };

    fileInput.click();
  };


  const handleDelete = async (title) => {
    const userId = localStorage.getItem("user_id");
  
    try {
      await axios.delete("http://localhost:8000/delete-music/", {
        params: {
          user_id: userId,
          title: title,
        },
      });
  
      // 삭제 성공 시 목록 새로고침
      setSongs((prevSongs) => prevSongs.filter((song) => song.title !== title));
      alert("삭제 완료!");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 오류 발생");
    }
  };
  
  
  
  const handleSheetUpload = async (song) => {
    if (!song || !song.file_url) {
      alert("파일을 선택하세요.");
      return;
    }

    try {
      const res = await axios.get(song.file_url, { responseType: "blob" });
      const file = new File([res.data], song.title + ".mp3", { type: "audio/mpeg" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", "guitar");
      formData.append("title", song.title);
      formData.append("composer", "Unknown");
      formData.append("outputs", "pdf,midi");

      const uploadRes = await axios.post("http://localhost:8000/convert/transcription/", formData);
      setJobId(uploadRes.data.job_id);
      alert(`파일 업로드 완료! Job ID: ${uploadRes.data.job_id}`);
    } catch (error) {
      console.error("악보 업로드 실패:", error);
      alert("파일 업로드 실패!");
    }
  };

  const handleSheetDownload = async () => {
    if (!jobId) {
      alert("먼저 파일을 업로드하세요.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8000/convert/download/${jobId}/${outputType}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${jobId}.${outputType}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      alert("파일 다운로드 완료!");
    } catch (error) {
      console.error("다운로드 실패:", error);
      alert("다운로드 실패!");
    }
  };

  return (
    <div className="container">
      <Header />
      <div className={styles.container}>
        <ControlPanel selectedSong={selectedSong} audioRef={audioRef} />
        {songs.length === 0 ? (
          <p className={styles.noSongs}>아직 업로드한 곡이 없습니다 🎶</p>
        ) : (
          <SongList
            songs={songs}
            onSongSelect={handleSongSelect}
            onDelete={handleDelete}
            onSheetUpload={handleSheetUpload}
            onSheetDownload={handleSheetDownload}
          />
        )}
      </div>

      <Button className={styles.uploadButton} onClick={handleFileUpload} icon={FaUpload}>
        음원 추가
      </Button>

      <audio ref={audioRef} />
    </div>
  );
};

export default MusicPage;
