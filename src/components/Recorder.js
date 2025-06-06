import React, { useState, useRef } from "react";
import styles from "../styles/PracticePage.module.css"; // 기존 버튼 스타일 재사용

const Recorder = () => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const isUploading = useRef(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setRecordedChunks([]);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        console.log("녹음 종료됨");
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("녹음을 시작할 수 없습니다: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const uploadRecording = async () => {
    if (isUploading.current) return;

    if (recordedChunks.length === 0) {
      alert("저장할 녹음이 없습니다.");
      return;
    }

    const blob = new Blob(recordedChunks, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("file", blob, "recorded_audio.webm");

    isUploading.current = true;

    try {
      const res = await fetch("http://localhost:8000/record/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("업로드 실패");
      alert("녹음 저장 완료!");
    } catch (err) {
      alert("업로드 실패: " + err.message);
    } finally {
      isUploading.current = false;
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      {!isRecording ? (
        <button onClick={startRecording} className={styles.button}>🎙️ 녹음 시작</button>
      ) : (
        <button onClick={stopRecording} className={styles.button}>⏹️ 녹음 정지</button>
      )}
      <button onClick={uploadRecording} className={styles.button} style={{ marginLeft: "10px" }}>
        💾 녹음 저장
      </button>
    </div>
  );
};

export default Recorder;
