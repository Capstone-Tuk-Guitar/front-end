import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from "../components/Header";
import styles from "../styles/RecordPage.module.css";

function RecordPage() {
  const [records, setRecords] = useState([]);       // DB 연주 기록
  const [files, setFiles] = useState([]);           // uploads/record 폴더의 mp3 목록
  const [loading, setLoading] = useState({});       // 파일별 변환 중 상태

  const delay = 60000;       // Klango.io 처리 대기 시간 (1분)
  const outputType = "midi";
  const downloadType = "midi";

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        alert("로그인이 필요합니다.");
        return;
      }
      try {
        // 1) DB에 저장된 연주 기록 가져오기
        const recRes = await axios.get(`http://localhost:8000/get-records/${userId}`);
        setRecords(recRes.data);

        // 2) uploads/record 폴더의 mp3 파일 목록 가져오기
        const filesRes = await axios.get("http://localhost:8000/record-files/");
        setFiles(filesRes.data.recording || []);
      } catch (err) {
        console.error("데이터 불러오기 실패:", err);
        alert("데이터를 불러오는 중 오류가 발생했습니다.");
      }
    };

    fetchData();
  }, []);

  const handleConvert = async (filename) => {
    if (loading[filename]) return;
    setLoading(prev => ({ ...prev, [filename]: true }));

    try {
      const mp3Res = await fetch(`http://localhost:8000/static/record-files/${filename}`);
      if (!mp3Res.ok) throw new Error("MP3 파일을 가져올 수 없습니다.");
      const mp3Blob = await mp3Res.blob();
      const file = new File([mp3Blob], filename, { type: "audio/mpeg" });

      //Klango.io 변환 요청
      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", "guitar");
      formData.append("title", filename);
      formData.append("composer", "Unknown");
      formData.append("outputs", outputType);

      const trRes = await fetch("http://localhost:8000/convert/transcription/", {
        method: "POST",
        body: formData,
      });
      if (!trRes.ok) throw new Error("변환 요청 실패");
      const { job_id } = await trRes.json();

      setTimeout(() => {
        let attempts = 0;
        const maxAttempts = 5;

        const interval = setInterval(async () => {
          attempts++;
          try {
            const dlRes = await fetch(
              `http://localhost:8000/convert/download/${job_id}/${downloadType}`
            );
            if (dlRes.status === 200) {
              clearInterval(interval);
              const midiBlob = await dlRes.blob();
              const url = URL.createObjectURL(midiBlob);
              const a = document.createElement("a");
              a.href = url;
              a.download = filename.replace(/\.mp3$/i, `.${downloadType}`);
              document.body.appendChild(a);
              a.click();
              a.remove();
              setLoading(prev => ({ ...prev, [filename]: false }));
            } else if (attempts >= maxAttempts) {
              throw new Error("다운로드 타임아웃");
            }
          } catch (err) {
            console.warn(`폴링 ${attempts}회 실패:`, err);
            if (attempts >= maxAttempts) {
              clearInterval(interval);
              alert(`${filename} MIDI 변환에 실패했습니다.`);
              setLoading(prev => ({ ...prev, [filename]: false }));
            }
          }
        }, 3000);
      }, delay);

    } catch (err) {
      console.error("MIDI 변환 중 오류 발생:", err);
      alert("MIDI 변환 요청에 실패했습니다.");
      setLoading(prev => ({ ...prev, [filename]: false }));
    }
  };

  const grouped = records.reduce((acc, rec) => {
    if (!acc[rec.music_title]) acc[rec.music_title] = [];
    acc[rec.music_title].push(rec);
    return acc;
  }, {});

  return (
    <div className="container">
      <Header />
      <h1>녹음 파일 목록 & MIDI 변환</h1>

      <div className={styles.flexContainer}>
        {/* 좌측: DB 연주 기록 */}
        <div className={styles.leftPanel}>
          {Object.keys(grouped).length === 0 ? (
            <p>연주 기록이 없습니다.</p>
          ) : (
            Object.entries(grouped).map(([title, recs]) => (
              <div key={title} className={styles.recordGroup}>
                <h2 className={styles.title}>{title}</h2>
                <ul className={styles.recordList}>
                  {recs.map(r => (
                    <li key={r.record_id} className={styles.recordItem}>
                      <span>{r.record_file}</span>
                      <span>정확도: {r.accuracy}%</span>
                      <span>{new Date(r.record_date).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* 우측: MP3 파일 & MIDI 변환 버튼 */}
        <div className={styles.rightPanel}>
          <h2 className={styles.title}>녹음 파일</h2>
          {files.length === 0 ? (
            <p>녹음된 파일이 없습니다.</p>
          ) : (
            <ul className={styles.recordList}>
              {files.map(filename => (
                <li key={filename} className={styles.recordItem}>
                  <span className={styles.fileName}>{filename}</span>
                  <audio
                    controls
                    src={`http://localhost:8000/static/record-files/${filename}`}
                  />
                  <button
                    className={styles.convertButton}
                    onClick={() => handleConvert(filename)}
                    disabled={!!loading[filename]}
                  >
                    {loading[filename] ? "변환중…" : "MIDI 변환"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecordPage;
