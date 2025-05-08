import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Button from "../components/Button";
import PracticeViewer from "../components/PracticeViewer";
import styles from "../styles/PracticePage.module.css";

function PracticePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [xmlFile, setXmlFile] = useState(null);
  const [song, setSong] = useState();

  useEffect(() => {
    if (location.state?.fileUrl && location.state?.song) {
      setXmlFile(location.state.fileUrl);
      setSong(location.state.song);
      localStorage.setItem("xmlFile", location.state.fileUrl);
      localStorage.setItem("song", JSON.stringify(location.state.song));
    } else {
      const savedFileUrl = localStorage.getItem("xmlFile");
      const savedSong = localStorage.getItem("song");
      if (savedFileUrl && savedSong) {
        setXmlFile(savedFileUrl);
        setSong(JSON.parse(savedSong));
      } else {
        alert("악보 정보가 없습니다. 다시 곡을 선택해주세요.");
        navigate("/select_song");
      }
    }
  }, [location, navigate]);


  // 임시
  const fileInputRef = useRef();

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setXmlFile(fileUrl);
    }
  };
  
  return (
    <div className="container">
      <Header />

      <div className={styles.container} >
        <Button onClick={handleUploadClick}>
          GP5 파일 직접 업로드하여 렌더링 (임시)
        </Button>
        <input
          type="file"
          accept=".gp5"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        <PracticeViewer xmlFile={xmlFile} />
      </div>
    </div>
  );
}

export default PracticePage;
