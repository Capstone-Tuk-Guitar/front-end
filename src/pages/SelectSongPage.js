import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SongList from "../components/SongList";
import Header from "../components/Header";
import styles from "../styles/SelectSongPage.module.css";

import playImage from "../assets/play.svg";
import pauseImage from "../assets/pause.svg";
import panelImage from "../assets/record.svg";

const SelectSongPage = () => {
    const [fileUrl, setFileUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);     // 현재 선택된 곡 정보
    const [songs, setSongs] = useState([]);                     // 업로드된 곡 목록
    const audioRef = useRef(new Audio());                       // 오디오 재생 참조
    
    const [outputType] = useState("gp5");
    const [delay] = useState(60000);                            // klangio api 대기 시간 (1분)
    const [loadingSongs, setLoadingSongs] = useState({});

    const navigate = useNavigate();

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
            setIsPlaying(false);
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

    //get job_id + 악보 렌더링
    const handleDownload = async (song) => {
        setLoadingSongs((prev) => ({ ...prev, [song.title]: true }));

        try {
            const fileRes = await fetch(`http://localhost:8000/uploads/${encodeURIComponent(song.filename)}`);
            const fileBlob = await fileRes.blob();
            const file = new File([fileBlob], song.filename, { type: "audio/mpeg" });
    
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
    
            // 1분 대기 후 GP5 파일 다운로드
            setTimeout(async () => {
                try {
                    const res = await fetch(`http://localhost:8000/convert/download/${job_id}/${outputType}`);
                    if (res.status === 200) {
                        const serverFileUrl = `http://localhost:8000/convert/download/${job_id}/${outputType}`;

                        setFileUrl(serverFileUrl);
                        setSelectedSong(song);
                        setIsDownloaded(true);
                    } else {
                        alert("변환된 파일을 불러오지 못했습니다.");
                    }
                } catch (err) {
                    console.warn("다운로드 실패:", err);
                    alert("파일 다운로드에 실패했습니다.");
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
                            navigate("/practice", {
                                state: {
                                    fileUrl,
                                    song: selectedSong,
                                },
                            });
                        } else {
                          alert("악보 다운로드 후 다시 시도해 주세요.");
                        }
                    }}
                >
                    <img src={panelImage} alt="" className={styles.img} />
                </div>
                </div>
            </div>
            <audio ref={audioRef} />
        </div>
    );
};

export default SelectSongPage;
