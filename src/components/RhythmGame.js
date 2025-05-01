import React, { useRef, useState } from "react";
import styles from "../styles/RhythmGame.module.css";

export const RhythmGame = ({ expectedChord }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const wsRef = useRef(null);
  const [fillColor, setFillColor] = useState("#000");
  const detectedChordRef = useRef(null); 
  const [detectedChord, setDetectedChord] = useState(null);

  const noteStartTimeRef = useRef(Date.now());
  const noteXRef = useRef(520);
  const recentNotesRef = useRef([]);
  const lastUpdateTimeRef = useRef(0);
  const matchOccurredRef = useRef(false); // 매치 여부 저장

  const BPM = 60;
  const beatInterval = 60 / BPM;
  const noteTravelTime = beatInterval * 6 * 1000;

  const noteColors = {
    match: "#4ade80",  // green
    miss: "#f87171",   // red
    neutral: "#94a3b8", // gray
  };

  const normalizeChord = (chordStr) => {
    if (!chordStr || typeof chordStr !== "string") return null;
    chordStr = chordStr.trim().replace(/\s+/g, " "); // 중복 공백 제거
    const [root, type] = chordStr.split(" ");
    const normType = type?.toLowerCase() === "major" ? "maj" :
                     type?.toLowerCase() === "minor" ? "min" : type;
    return `${root} ${normType}`.trim();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 50;

    const barWidth = 20;
    const barHeight = 60;
    const barX = noteXRef.current;
    const barY = centerY - barHeight / 2;
    const barCenterX = barX + barWidth / 2;

    const distance = Math.abs(barCenterX - centerX);
    const isInsideCircle = distance < radius;
    const isMatch = normalizeChord(expectedChord) === normalizeChord(detectedChordRef.current);
   
    // 판정 로직
    if (isInsideCircle) {
      if (isMatch && !matchOccurredRef.current) {
        matchOccurredRef.current = true;
        setFillColor(noteColors.match); // 초록색
      } else if (!matchOccurredRef.current && fillColor !== noteColors.miss) {
        setFillColor(noteColors.miss); // 빨간색
      }
    } else {
      // 원 밖일 경우 초기화
      if (fillColor !== "#000") {
        matchOccurredRef.current = false;
        setFillColor("#000");
      }
    }

    // 원 그리기
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("♪", centerX, centerY + 10);

    // 바 색 결정
    let barColor = noteColors.neutral;
    if (isInsideCircle) {
      barColor = matchOccurredRef.current ? noteColors.match : noteColors.miss;
    }

    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, barWidth, barHeight);
  };

  const updateBarPosition = () => {
    const elapsed = Date.now() - noteStartTimeRef.current;
    const progress = elapsed / noteTravelTime;
    const startX = canvasRef.current?.width || 520;
    const endX = 0;

    if (progress >= 1.0) {
      noteStartTimeRef.current = Date.now();
      noteXRef.current = startX;
      recentNotesRef.current = [];
      matchOccurredRef.current = false;
      setFillColor("#000");
    } else {
      noteXRef.current = startX - (startX - endX) * progress;
    }
  };

  const loop = () => {
    updateBarPosition();
    draw();
    animationRef.current = requestAnimationFrame(loop);
  };

  const startAnimation = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.warn("WebSocket already connected.");
      return;
    }

    wsRef.current = new WebSocket("ws://localhost:8000/ws/chordprac");

    wsRef.current.onmessage = (event) => {
      const now = Date.now();
      if (now - lastUpdateTimeRef.current < 500) return;
      lastUpdateTimeRef.current = now;

      const data = JSON.parse(event.data);
      if (data.chord) {
        let { root, type } = data.chord;
        if (type === "maj") type = "major";
        if (type === "min") type = "minor";
        const chordStr = `${root} ${type}`;
        setDetectedChord(chordStr);
        detectedChordRef.current = chordStr; // <- 즉시 저장
      }
    };

    noteStartTimeRef.current = Date.now();
    animationRef.current = requestAnimationFrame(loop);
  };

  const stopAnimation = () => {
    cancelAnimationFrame(animationRef.current);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
      wsRef.current = null;
    }

    recentNotesRef.current = [];
    matchOccurredRef.current = false;
    setDetectedChord(null);
    noteXRef.current = canvasRef.current?.width || 520;

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    setFillColor("#000");
  };

  return (
    <div className={styles.container}>
      <p className={styles.label}>
        선택한 코드: <strong>{expectedChord}</strong>
      </p>
      {detectedChord && (
        <p className={styles.label}>
          인식된 코드: <strong>{detectedChord}</strong>
        </p>
      )}

      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          width={520}
          height={150}
          className={styles.canvas}
        />
        <div className={styles.buttonGroup}>
          <button
            onClick={startAnimation}
            className={`${styles.button} ${styles.start}`}
          >
            시작
          </button>
          <button
            onClick={stopAnimation}
            className={`${styles.button} ${styles.stop}`}
          >
            정지
          </button>
        </div>
      </div>
    </div>
  );
};

export default RhythmGame;
