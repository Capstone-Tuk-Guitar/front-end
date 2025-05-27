import React, { useEffect, useRef, useState } from "react";
import "../styles/Playing.css";

const normalizeChord = (chord) => {
  if (!chord || typeof chord !== "string") return "";
  chord = chord.trim().replace(/\s+/g, " ");
  const [root, type] = chord.split(" ");
  const displayType = type === "maj" ? "major" :
                      type === "min" ? "minor" : type;
  return `${root} ${displayType}`.trim();
};

const Playing = ({ chordTimeline, audioRef }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [detectedChord, setDetectedChord] = useState("---");
  const blocksRef = useRef([]);
  const startTimeRef = useRef(null);
  const wsRef = useRef(null);

  const BLOCK_WIDTH = 50;
  const BLOCK_HEIGHT = 30;
  const SPEED = 100; 
  const CANVAS_WIDTH = 1000;
  const JUDGE_X = CANVAS_WIDTH / 2;
  const TIMING_WINDOW = 0.25; // ±0.25초

  const connectWebSocket = () => {
    wsRef.current = new WebSocket("ws://localhost:8000/ws/chordprac");

    wsRef.current.onopen = () => {
      wsRef.current.send("start");
    };

    wsRef.current.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Top-3 Chords Received:", data.top3_chords);

  if (data.top3_chords && data.top3_chords.length > 0) {
    const expectedChords = blocksRef.current.map(block => normalizeChord(block.chord));
    const top3Chords = data.top3_chords.map(normalizeChord);
    const primaryChord = normalizeChord(data.primary || "");

    // expected와 top-3 중 일치하는 값이 있는지 확인
    let matchedChord = null;

    for (let expected of expectedChords) {
      if (top3Chords.includes(expected)) {
        matchedChord = expected;
        break;
      }
    }

    const finalChord = matchedChord || primaryChord || "---";
    setDetectedChord(finalChord);
  } else {
    setDetectedChord("---");
  }
};
  };

 const initializeBlocks = () => {
  const blocks = chordTimeline.map(({ chord, time }) => ({
    chord,
    time,
    x: CANVAS_WIDTH + time * SPEED, 
    judged: false,
    state: "pending"
  }));
  blocksRef.current = blocks;
};

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 판정선
    ctx.fillStyle = "#888";
    ctx.fillRect(JUDGE_X - 2, 0, 4, canvas.height);

    blocksRef.current.forEach((block) => {
      const colorMap = {
        pending: "#94a3b8",
        match: "#4ade80",
        miss: "#f87171"
      };
      ctx.fillStyle = colorMap[block.state] || "#94a3b8";
      ctx.fillRect(block.x, canvas.height / 2 - BLOCK_HEIGHT / 2, BLOCK_WIDTH, BLOCK_HEIGHT);

      ctx.fillStyle = "#fff";
      ctx.font = "18px Arial";
      ctx.textAlign = "center";
      ctx.fillText(block.chord, block.x + BLOCK_WIDTH / 2, canvas.height / 2 + 6);
    });
  };

  const update = () => {
    const currentTime = (Date.now() - startTimeRef.current) / 1000;

    blocksRef.current.forEach((block) => {
      block.x = JUDGE_X + (block.time - currentTime) * SPEED - BLOCK_WIDTH / 2;

      const expected = normalizeChord(block.chord);
      const actual = normalizeChord(detectedChord);
      const timeDelta = currentTime - block.time;

      if (!block.judged && Math.abs(timeDelta) <= TIMING_WINDOW) {
        block.judged = true;
        if (expected === actual) {
          block.state = "match";
          console.log("✅ match", expected, actual);
        } else {
          block.state = "miss";
          console.log("❌ miss (wrong)", expected, actual);
        }
      }

      if (!block.judged && timeDelta > TIMING_WINDOW) {
        block.judged = true;
        block.state = "miss";
        console.log("❌ miss (too late)", expected, actual);
      }
    });

    draw();
    animationRef.current = requestAnimationFrame(update);
  };

  const start = () => {
    if (!canvasRef.current) return;
    startTimeRef.current = Date.now();
    initializeBlocks();
    connectWebSocket();
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    animationRef.current = requestAnimationFrame(update);
  };

  const stop = () => {
    cancelAnimationFrame(animationRef.current);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send("stop");
      wsRef.current.close();
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={150}
        style={{ border: "1px solid #ccc" }}
      />
      <div>
        <button onClick={start} style={{ margin: "10px" }}>시작</button>
        <button onClick={stop}>정지</button>
      </div>
      <p>감지된 코드: {detectedChord}</p>
    </div>
  );
};

export default Playing;