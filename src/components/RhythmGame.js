import React, { useRef, useState } from "react";
import styles from "../styles/RhythmGame.module.css";

export const RhythmGame = ({ expectedChord }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const wsRef = useRef(null);
  const [fillColor, setFillColor] = useState("#000");
  const [detectedChord, setDetectedChord] = useState(null);

  const noteStartTimeRef = useRef(Date.now());
  const noteXRef = useRef(520);
  const showResultRef = useRef(false);
  const recentNotesRef = useRef([]);
  const lastUpdateTimeRef = useRef(0);

  const BPM = 60;
  const beatInterval = 60 / BPM;
  const noteTravelTime = beatInterval * 4 * 1000;

  const noteColors = {
    match: "#4ade80",
    miss: "#f87171",
    neutral: "#94a3b8",
  };

  const normalizeType = (type) => {
    if (type === "major") return "maj";
    if (type === "minor") return "min";
    return type;
  };

  const normalizeChord = (chordStr) => {
    if (!chordStr || !chordStr.includes(" ")) return chordStr;
    const [root, type] = chordStr.split(" ");
    return `${root} ${normalizeType(type.toLowerCase())}`;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return; // 캔버스가 없으면 종료
    const ctx = canvas.getContext("2d"); // 2D 컨텍스트 가져오기
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 이전 프레임 지우기
  
    const centerX = canvas.width / 2; // 원의 중심 X
    const centerY = canvas.height / 2; // 원의 중심 Y
    const radius = 50; // 원의 반지름
  
    // 이동하는 바 그리기
    const barWidth = 20; // 바의 너비
    const barHeight = 60; // 바의 높이
    const barX = noteXRef.current; // 바의 X 좌표
    const barY = centerY - barHeight / 2; // 바의 Y 좌표
    const barCenterX = barX + barWidth / 2; // 바의 중심 X 좌표
    const distance = Math.abs(barCenterX - centerX); // 바 중심과 원 중심의 거리 계산
    const isInsideCircleForBar = distance < radius;  // 바가 원 안에 들어가면 true
    const isInsideCircle = distance < radius;
    const isMatch= (expectedChord === detectedChord);

    let barColor = noteColors.neutral; // 기본 색상 설정
    
     //타겟 원 색상 결정
     let targetColor = "#000"; // 기본 색상
     if (isInsideCircle) {
       targetColor = showResultRef.current ? fillColor : noteColors.miss; // 원 안에 있을 때 색상 변경
       if(isMatch){ 
        barColor = isMatch ? noteColors.match : noteColors.miss; // 일치하면 초록색, 아니면 빨간색
        setFillColor(barColor);  // 색상 업데이트
        showResultRef.current = true;}
     } else if (showResultRef.current) {
       targetColor = fillColor; // 결과가 표시된 경우 색상 설정
     }
   
     // 원 그리기
     ctx.beginPath();
     ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
     ctx.fillStyle = targetColor; // 타겟 원 색상 설정
     ctx.fill();
   
     
     ctx.fillStyle = "#fff";
     ctx.font = "28px Arial";
     ctx.textAlign = "center";
     ctx.fillText("♪", centerX, centerY + 10); // "♪" 기호 가운데에 위치

    // 바 색상 결정
    if (showResultRef.current) {
      barColor = fillColor; // 이미 판정된 결과가 있으면 그 색상
    } else if (isInsideCircleForBar && expectedChord && detectedChord) {
      // 원 안에 바가 들어가면, 코드 일치 여부를 판별
      if(isMatch){ 
        barColor = isMatch ? noteColors.match : noteColors.miss; // 일치하면 초록색, 아니면 빨간색
        setFillColor(barColor);  // 색상 업데이트
        showResultRef.current = true;}
  
      setTimeout(() => {
        showResultRef.current = false;
        setFillColor("#000");
      }, 800);
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
        setDetectedChord(`${root} ${type}`);
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
    showResultRef.current = false;
    setDetectedChord(null);
    noteXRef.current = canvasRef.current?.width || 520;

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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