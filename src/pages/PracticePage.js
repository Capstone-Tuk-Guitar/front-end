import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import PracticeViewer from "../components/PracticeViewer";

function PracticePage() {
    // 페이지 이동 함수
    const navigate = useNavigate();
    const [musicXmlFile, setMusicXmlFile] = useState(null);
    const [midiFile, setMidiFile] = useState(null);

    // 클릭 함수
    const handleClick = () => {
        navigate("/accuracy");   // MusicPage로 이동
    }
    
    const handleFileChange = (event) => {
        if (event.target.files.length > 0) {
            setMidiFile(event.target.files[0]);
            setMusicXmlFile(event.target.files[0]);
        }
    };

    const mxlDownload = async () => {
        if (!midiFile) return alert("MIDI 파일을 먼저 선택하세요.");
    
        const formData = new FormData();
        formData.append("file", midiFile);
    
        try {
          const response = await fetch("http://localhost:8000/mxl-converter/", {
            method: "POST",
            body: formData,
          });
    
          if (!response.ok) throw new Error("변환 실패");
    
          let filename = "converted.mxl"; // 기본값
          const disposition = response.headers.get("Content-Disposition");
          if (disposition && disposition.includes("filename=")) {
            filename = disposition
              .split("filename=")[1]
              .split(";")[0]
              .replace(/['"]/g, ""); // 따옴표 제거
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
    
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
    
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error("변환 오류:", error);
          alert("변환 중 오류가 발생했습니다.");
        }
      };
    

    return (
        <div className="container">
            <Header />

            <div>
                <input type="file" accept=".mid" onChange={handleFileChange} />
                <button onClick={mxlDownload} style={{ marginLeft: "10px" }}>
                    MIDI → MusicXML 변환 및 다운로드
                </button>
                <br />

                <input type="file" accept=".mxl, .musicxml" onChange={handleFileChange} />
                <br />
                
                {/* 악보 렌더링 */}
                <PracticeViewer musicXmlFile={musicXmlFile} />
                <br />
                <br />
                <br />

                <button onClick={handleClick}>MIDI 파일 비교하기</button>
            </div>
        </div>
    );
}

export default PracticePage;