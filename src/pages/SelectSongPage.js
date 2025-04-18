import React, { useState, useEffect, useRef } from "react";
import SongList from "../components/SongList";
import Header from "../components/Header";
import styles from "../styles/SelectSongPage.module.css";

import playImage from "../assets/play.svg";
import pauseImage from "../assets/pause.svg";
import musicImage from "../assets/music.svg";

const SelectSongPage = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [, setSelectedSong] = useState(null);     // 현재 선택된 곡 정보
    const [songs, setSongs] = useState([]);                     // 업로드된 곡 목록
    const audioRef = useRef(new Audio());                       // 오디오 재생 참조
    const [outputType] = useState("midi");
    const [delay] = useState(60000);                            // 기본값: 1분 (60000ms)

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

    //get job_id + 다운로드
    const handleDownload = async (song) => {
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
            console.log("job_id:", job_id);

            // 1분 대기 후 다운로드 시작
            setTimeout(() => startDownloadPolling(job_id, song.title, outputType), delay);
        } catch (err) {
            console.error("다운로드 요청 실패:", err);
            alert("변환 요청에 실패했습니다.");
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
                <SongList
                    songs={songs}
                    onSongSelect={handleSongSelect}
                    onDownloadGP5={(song) => handleDownload(song)}
                    showDownloadPDF={false}
                    showDownloadGP5={true}
                    showDelete={false}
                />
                <div className={styles.controlContainer}>
                {isPlaying ? (
                    <img src={pauseImage} onClick={handlePause} className={styles.button} alt="일시정지" />
                ) : (
                    <img src={playImage} onClick={handlePlay} className={styles.button} alt="재생" />
                )}
                <div className={styles.sheetContainer}>
                        <img src={musicImage} alt="악보 미리보기" />
                </div>
                </div>
            </div>
            <audio ref={audioRef} />
        </div>
    );
};

export default SelectSongPage;
