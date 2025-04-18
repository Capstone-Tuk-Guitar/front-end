import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SongList from "../components/SongList";
import Header from "../components/Header";
import styles from "../styles/SelectSongPage.module.css";

import playImage from "../assets/play.svg";
import pauseImage from "../assets/pause.svg";

const SelectSongPage = () => {
    const navigate = useNavigate();
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [, setSelectedSong] = useState(null);
    const [songs, setSongs] = useState([]);                     // 업로드된 곡 목록
    const audioRef = useRef(new Audio());
    
    const outputType = "gp5";
    const delay = 60000;                                        // 기본값: 1분 (60000ms)
    const [loadingSongs, setLoadingSongs] = useState({});
    const [isDownloaded, setIsDownloaded] = useState(false);

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
          audioRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch((err) => {
              console.warn("재생 실패:", err);
              setIsPlaying(false);
            });
        }
      };

    const handlePlay = () => {
        if (audioRef.current && audioRef.current.src) {
          audioRef.current.play()
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

    // get job_id + gp5 연습 페이지로 넘기기
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
            setIsDownloaded(true);

            // 1분 대기 후 다운로드 시작
            setTimeout(async () => {
                const res = await fetch(`http://localhost:8000/convert/download/${job_id}/gp5`);
                if (res.status === 200) {
                    const blob = await res.blob();
                    const fileUrl = URL.createObjectURL(blob);              // blob URL만 생성
                    navigate("/practice", { state: { song, fileUrl } });    // PracticePage로 이동하며 전달
                } else {
                    alert("변환된 파일을 불러오지 못했습니다.");
                }
                setLoadingSongs((prev) => ({ ...prev, [song.title]: false }));
            }, delay);
        } catch (err) {
            console.error("다운로드 요청 실패:", err);
            alert("변환 요청에 실패했습니다.");
            setLoadingSongs((prev) => ({ ...prev, [song.title]: false }));
        }
    };

    return (
        <div className="container">
            <Header />
            
            <div className={styles.container}>
                <SongList
                    songs={songs}
                    onSongSelect={handleSongSelect}
                    onDownload={handleDownload}
                    showDelete={false}
                    loadingSongs={loadingSongs}
                />
                <div className={styles.controlContainer}>
                    {isPlaying ? (
                        <img src={pauseImage} onClick={handlePause} className={styles.button} alt="일시정지" />
                    ) : (
                        <img src={playImage} onClick={handlePlay} className={styles.button} alt="재생" />
                    )}
                    <div
                        className={styles.sheetContainer}
                        onClick={() => {
                            if (isDownloaded) {
                                navigate("/practice");
                            } else {
                                alert("GP5 파일을 먼저 다운로드해 주세요.");
                            }
                        }}
                    >
                        <p>악보가 아직 렌더링되지 않았습니다.</p>
                    </div>
                </div>
            </div>
            <audio ref={audioRef} />
        </div>
    );
};

export default SelectSongPage;
