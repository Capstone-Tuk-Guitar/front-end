import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import styles from "../styles/RhythmGame.module.css";

export const RhythmGame = ({ expectedChord }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const wsRef = useRef(null); // WebSocket 참조

  const [chordNotes, setChordNotes] = useState({});
  const [currentNote, setCurrentNote] = useState(null);
  const [lastDetectedNote, setLastDetectedNote] = useState(null);
  const [lastMatchStatus, setLastMatchStatus] = useState("neutral");

  const noteStartTimeRef = useRef(Date.now());
  const noteXRef = useRef(520);
  const showResultRef = useRef(false);

  const BPM = 60;
  const beatInterval = 60 / BPM;
  const noteTravelTime = beatInterval * 4 * 1000;

  const noteColors = {
    match: "#4ade80",
    miss: "#f87171",
    neutral: "#94a3b8",
  };

  useEffect(() => {
    axios
      .get("http://localhost:8000/chords")
      .then((response) => setChordNotes(response.data.chords))
      .catch((error) => console.error("Error fetching chord data:", error));
  }, []);

  const checkMatch = (note) => {
    const [root, type] = expectedChord.split(" ");
    const expectedNotes = chordNotes[root]?.[type] || [];
    return expectedNotes.includes(note);
  };

  const updateBarPosition = () => {
    const elapsed = Date.now() - noteStartTimeRef.current;
    const progress = elapsed / noteTravelTime;
    const startX = 520;
    const endX = 100;

    if (progress >= 1.0) {
      if (currentNote) {
        const isMatch = checkMatch(currentNote);
        setLastDetectedNote(currentNote);
        setLastMatchStatus(isMatch ? "match" : "miss");
        showResultRef.current = true;

        setTimeout(() => {
          showResultRef.current = false;
          setLastDetectedNote(null);
          setLastMatchStatus("neutral");
        }, 800);
      }
      noteStartTimeRef.current = Date.now();
      noteXRef.current = startX;
    } else {
      noteXRef.current = startX - (startX - endX) * progress;
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(100, 75, 25, 0, 2 * Math.PI);
    ctx.fillStyle = "#000";
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText("♪", 91, 83);

    if (showResultRef.current && lastDetectedNote) {
      ctx.fillStyle = noteColors[lastMatchStatus];
      ctx.font = "18px Arial";
      ctx.fillText(lastDetectedNote, 85, 115);
    }

    ctx.fillStyle = showResultRef.current
      ? noteColors[lastMatchStatus]
      : noteColors.neutral;

    ctx.fillRect(noteXRef.current, 60, 20, 30);
  };

  const loop = () => {
    updateBarPosition();
    draw();
    animationRef.current = requestAnimationFrame(loop);
  };

  const startAnimation = () => {
    // WebSocket 연결
    wsRef.current = new WebSocket("ws://localhost:8000/ws/chordprac");
    wsRef.current.onmessage = (event) => setCurrentNote(event.data);

    noteStartTimeRef.current = Date.now();
    animationRef.current = requestAnimationFrame(loop);
  };

  const stopAnimation = () => {
    cancelAnimationFrame(animationRef.current);

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setCurrentNote(null);
    setLastDetectedNote(null);
    setLastMatchStatus("neutral");
    showResultRef.current = false;
  };

  return (
    <div className={styles.container}>
      <p className={styles.label}>
        선택한 코드: <strong>{expectedChord}</strong>
      </p>

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
