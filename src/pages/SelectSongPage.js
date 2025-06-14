import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SongList from "../components/SongList";
import Header from "../components/Header";
import SelectSongControls from "../components/SelectSongControls";
import styles from "../styles/SelectSongPage.module.css";

const SelectSongPage = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);           // 현재 선택된 곡 정보
  const [songs, setSongs] = useState([]);                           // 곡 목록
  const [chordTimeline, setChordTimeline] = useState([]);
  const audioRef = useRef(new Audio());                             // 오디오 객체
  const [loadingSongs, setLoadingSongs] = useState({});
  const navigate = useNavigate();

  const outputType = "mxml";
  const downloadType = "xml";
  const delay = 60000;                                              // klangio api 대기 시간 (1분)

  // 곡 목록 불러오기
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const username = localStorage.getItem("user_id");
        const response = await fetch(`http://localhost:8000/music/${username}`);
        if (!response.ok) throw new Error("Failed to fetch songs");
        const data = await response.json();
        setSongs(data);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };
    fetchSongs();
  }, []);

  // 곡 선택 시 재생 준비
  const handleSongSelect = (song) => {
    navigate("/practice", {
      state: {
        fileUrl: song.fileUrl,
        song: song,
        audioUrl: song.audioUrl,
        chordTimeline: song.chordTimeline
      }
    });
  };

  const handlePlay = () => {
    if (audioRef.current && audioRef.current.src) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("재생 실패:", err);
          setIsPlaying(false);
        });
    } else {
      alert("먼저 곡을 선택하거나 업로드하세요.");
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const analyzeXml = async (fileUrl) => {
    try {
      const xmlRes = await fetch(fileUrl);
      const xmlBlob = await xmlRes.blob();
      const xmlFile = new File([xmlBlob], "converted.xml", { type: "text/xml" });

      const formData = new FormData();
      formData.append("file", xmlFile);

      const res = await fetch("http://localhost:8000/xml_info/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("XML 분석 실패");
      const data = await res.json();
      return data.chords || [];
    } catch (err) {
      console.error("XML 분석 에러:", err);
      return [];
    }
  };

  // get job_id
  const handleDownload = async (song) => {
    setLoadingSongs((prev) => ({ ...prev, [song.music_id]: true }));

    try {
      const fileRes = await fetch(`http://localhost:8000/stream-music/${song.music_id}`);
      const fileBlob = await fileRes.blob();
      const file = new File([fileBlob], `${song.title}.mp3`, { type: "audio/mpeg" });

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

      // 1분 대기 후 XML 파일 다운로드
      setTimeout(async () => {
        try {
          const res = await fetch(`http://localhost:8000/convert/download/${job_id}/${downloadType}`);
          if (res.status === 200) {
            const serverFileUrl = `http://localhost:8000/convert/download/${job_id}/${downloadType}`;
            setFileUrl(serverFileUrl);
            setSelectedSong(song);
            setIsDownloaded(true);

            const chords = await analyzeXml(serverFileUrl);
            setChordTimeline(chords);
          } else {
            alert("변환된 파일을 불러오지 못했습니다.");
          }
        } catch (err) {
          console.warn("다운로드 실패:", err);
          alert("파일 다운로드에 실패했습니다.");
        }
        setLoadingSongs((prev) => ({ ...prev, [song.music_id]: false }));
      }, delay);
    } catch (err) {
      console.error("다운로드 요청 실패:", err);
      alert("변환 요청에 실패했습니다.");
      setLoadingSongs((prev) => ({ ...prev, [song.music_id]: false }));
    }
  };

  const handlePractice = () => {
    if (isDownloaded && chordTimeline.length > 0) {
      navigate("/practice", {
        state: {
          fileUrl,
          song: selectedSong,
          audioUrl: `http://localhost:8000/stream-music/${selectedSong.music_id}`,
          chordTimeline
        }
      });
    } else {
      alert("악보 다운로드 후 다시 시도해 주세요.");
    }
  };

  return (
    <div className="container">
      <Header />
      <div className={styles.mainContent}>
        <div className={styles.container}>
          <SongList
            songs={songs}
            onSongSelect={handleSongSelect}
            onDownload={handleDownload}
            showDelete={false}
            loadingSongs={loadingSongs}
          />
          <SelectSongControls
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onPause={handlePause}
            onPractice={handlePractice}
          />
        </div>
      </div>
      <audio ref={audioRef} />
    </div>
  );
};

export default SelectSongPage;
