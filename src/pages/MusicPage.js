import React, { useState } from "react";
import ControlPanel from "../components/ControlPanel";
import SongList from "../components/SongList";
import styles from "../styles/MusicPage.module.css";

const MusicPage = () => {
  const [selectedSong, setSelectedSong] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [file, setFile] = useState(null);
  const [outputType, setOutputType] = useState("midi"); // 기본 다운로드 타입 설정

  const handleSongSelect = (song) => {
    setSelectedSong(song);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("파일을 선택하세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", "guitar");
    formData.append("title", "My Song");
    formData.append("composer", "Unknown");
    formData.append("outputs", "pdf,midi");

    try {
      const response = await fetch("http://127.0.0.1:8000/transcription/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const result = await response.json();
      console.log("Job ID:", result.job_id);
      setJobId(result.job_id);
      alert(`파일 업로드 완료! Job ID: ${result.job_id}`);
    } catch (error) {
      console.error("Error:", error);
      alert("파일 업로드 실패!");
    }
  };

  const handleDownload = async () => {
    if (!jobId) {
      alert("먼저 파일을 업로드하세요.");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/download/${jobId}/${outputType}`);

      if (!response.ok) {
        throw new Error("파일 다운로드 실패");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${jobId}.${outputType}`;
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
      <div className={styles.container}>
        {/* 왼쪽: 컨트롤 패널 */}
        <ControlPanel selectedSong={selectedSong} />

        {/* 중앙: 곡 리스트 */}
        <SongList onSongSelect={handleSongSelect} />
      </div>

      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>음원 파일 추가</button>
      {jobId && (
        <div>
          <p>Job ID: {jobId}</p>
          <label>
            다운로드 형식 선택: 
            <select value={outputType} onChange={(e) => setOutputType(e.target.value)}>
              <option value="midi">MIDI</option>
              <option value="pdf">PDF</option>
            </select>
          </label>
          <button onClick={handleDownload}>파일 다운로드</button>
        </div>
      )}
    </div>
  );
};

export default MusicPage;
