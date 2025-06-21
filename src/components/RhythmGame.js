import React, { useRef, useState, useCallback, useMemo } from "react";
import styles from "../styles/RhythmGame.module.css";

const RhythmGame = ({ expectedChord }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const wsRef = useRef(null);
  const [fillColor, setFillColor] = useState("#000");
  const detectedChordRef = useRef(null); 
  const [detectedChord, setDetectedChord] = useState(null); // 정지 상태에서는 null

  const noteStartTimeRef = useRef(Date.now());
  const noteXRef = useRef(520);
  const recentNotesRef = useRef([]);
  const prevChordRef = useRef(null); // NEW
  const matchOccurredRef = useRef(false);

  // 상수들을 useMemo로 메모이제이션
  const gameConfig = useMemo(() => {
    const BPM = 60;
    const beatInterval = 60 / BPM;
    return {
      BPM,
      beatInterval,
      noteTravelTime: beatInterval * 6 * 1000,
      noteColors: {
        match: "#4ade80",  // green
        miss: "#f87171",   // red
        neutral: "#94a3b8", // gray
      }
    };
  }, []);

  const normalizeChord = useCallback((chordStr) => {
    if (!chordStr || typeof chordStr !== "string") return "";
      chordStr = chordStr.trim().replace(/\s+/g, " ");
      const [root, type] = chordStr.split(" ");
      const displayType = type === "maj" ? "major" :
                          type === "min" ? "minor" : type;
      return `${root} ${displayType}`.trim();
  }, []);

  const draw = useCallback(() => {
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
   
    if (isInsideCircle) {
      if (isMatch && !matchOccurredRef.current) {
        matchOccurredRef.current = true;
        setFillColor(gameConfig.noteColors.match);
      } else if (!matchOccurredRef.current && fillColor !== gameConfig.noteColors.miss) {
        setFillColor(gameConfig.noteColors.miss);
      }
    } else {
      if (fillColor !== "#000") {
        matchOccurredRef.current = false;
        setFillColor("#000");
      }
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("♪", centerX, centerY + 10);

    let barColor = gameConfig.noteColors.neutral;
    if (isInsideCircle) {
      barColor = matchOccurredRef.current ? gameConfig.noteColors.match : gameConfig.noteColors.miss;
    }

    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, barWidth, barHeight);
  }, [expectedChord, fillColor, gameConfig.noteColors, normalizeChord]);

  const updateBarPosition = useCallback(() => {
    const elapsed = Date.now() - noteStartTimeRef.current;
    const progress = elapsed / gameConfig.noteTravelTime;
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
  }, [gameConfig.noteTravelTime]);

  const loopRef = useRef();
  
  const loop = useCallback(() => {
    updateBarPosition();
    draw();
    animationRef.current = requestAnimationFrame(loopRef.current);
  }, [updateBarPosition, draw]);

  loopRef.current = loop;

  const startAnimation = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send("start");
      return;
    }

    setDetectedChord("---");
    prevChordRef.current = "---";
    detectedChordRef.current = "---";

    wsRef.current = new WebSocket("ws://localhost:8000/ws/chordprac");

    wsRef.current.onopen = () => {
      wsRef.current.send("start");
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Top-4 Chords Received:", data.top4_chords);

      if (data.top4_chords && data.top4_chords.length > 0) {
        const normalizedExpected = normalizeChord(expectedChord);
        const normalizedTop4 = data.top4_chords.map(normalizeChord);
        const matchedChord = normalizedTop4.find(
          (chord) => chord === normalizedExpected
        );

        const finalChord = matchedChord || normalizeChord(data.primary) || "---";

        //중복된 코드 연속 수신 시 업데이트 생략
        if (finalChord !== prevChordRef.current) {
          setDetectedChord(finalChord);
          detectedChordRef.current = finalChord;
          prevChordRef.current = finalChord;
        }
      } else {
        if (prevChordRef.current !== "---") {
          setDetectedChord("---");
          detectedChordRef.current = "---";
          prevChordRef.current = "---";
        }
      }
    };

    noteStartTimeRef.current = Date.now();
    animationRef.current = requestAnimationFrame(loopRef.current);
  }, [expectedChord, normalizeChord]);

  const stopAnimation = useCallback(() => {
    cancelAnimationFrame(animationRef.current);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send("stop");
      wsRef.current.close();
      wsRef.current = null;
    }

    recentNotesRef.current = [];
    matchOccurredRef.current = false;
    setDetectedChord(null); // 감춤
    detectedChordRef.current = null;
    noteXRef.current = canvasRef.current?.width || 520;

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    setFillColor("#000");
  }, []);

  return (
    <div className={styles.container}>
      <p className={styles.label}>
        선택한 코드: <strong>{expectedChord}</strong>
      </p>
      {detectedChord !== null && (
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

// React.memo로 불필요한 렌더링 방지
export { RhythmGame };
export default React.memo(RhythmGame);
