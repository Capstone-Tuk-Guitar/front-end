import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PracticeViewer from "../components/PracticeViewer";
import styles from "../styles/PracticePage.module.css";

function PracticePage() {
  const navigate = useNavigate();
  const [midiFile, setMidiFile] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);

  const handleClick = () => {
    navigate("/accuracy");
  };

  const handleMidiFileChange = (event) => {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      setMidiFile(file);
      setXmlFile(null); // 기존 렌더링 초기화
    }
  };

  const handleXmlFileChange = (event) => {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const url = URL.createObjectURL(file);
      setXmlFile(url);
    }
  };

  const mxlRender = async () => {
    if (!midiFile) return alert("MIDI 파일을 먼저 선택하세요.");
  
    const formData = new FormData();
    formData.append("file", midiFile);
  
    try {
      console.log("1. 변환 요청 보냄");
  
      const response = await fetch("http://localhost:8000/mxl-converter/", {
        method: "POST",
        body: formData,
      });
  
      console.log("2. 응답 수신");
  
      if (!response.ok) {
        const errText = await response.text();
        console.error("응답 실패:", errText);
        throw new Error("변환 실패");
      }
  
      const blob = await response.blob();
      console.log("3. Blob 처리 완료");
  
      const url = window.URL.createObjectURL(blob);
      console.log("4. Blob URL 생성:", url);
  
      if (xmlFile) URL.revokeObjectURL(xmlFile); // 기존 blob 해제
      setXmlFile(url);
    } catch (error) {
      console.error("변환 오류:", error);
      alert("변환 중 오류가 발생했습니다.");
    }
  };
  

  return (
    <div className="container">
      <Header />

      <div className={styles.container} >
        {/* MIDI → 변환 및 렌더링 */}
        <input type="file" accept=".mid,.midi" onChange={handleMidiFileChange} />
        <button className={styles.renderButton} onClick={mxlRender} >
          MIDI → MXL 변환 및 렌더링
        </button>
        <br />
        <br />

        {/* 직접 .mxl 파일 업로드 */}{/* 임시 */}
        <input type="file" accept=".mxl" onChange={handleXmlFileChange} />
        <br />
        <br />

        <PracticeViewer xmlFile={xmlFile} />
        <br />
        <button onClick={handleClick}>MIDI 파일 비교하기</button>
      </div>
    </div>
  );
}

export default PracticePage;
