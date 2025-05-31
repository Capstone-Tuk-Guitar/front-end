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
  const TIMING_WINDOW = 0.3;

  const isWithinTimingWindow = (currentTime) => {
    return blocksRef.current.some(block => {
      const timeDelta = Math.abs(currentTime - block.time);
      return timeDelta <= TIMING_WINDOW;
    });
  };

  const connectWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    wsRef.current = new WebSocket("ws://localhost:8000/ws/chordprac");

    wsRef.current.onopen = () => {
      wsRef.current.send("start");
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const currentTime = (Date.now() - startTimeRef.current) / 1000;

      // 현재 시간이 타이밍 윈도우 내에 있는지 확인
      if (!isWithinTimingWindow(currentTime)) {
        setDetectedChord("---");
        return;
      }

      console.log("🎵 Top-4 Chords Received:", data.top4_chords);

      if (data.top4_chords && data.top4_chords.length > 0) {
        const top4Chords = data.top4_chords.map(normalizeChord);
        const primaryChord = normalizeChord(data.primary || "");

        blocksRef.current.forEach((block) => {
          const expected = normalizeChord(block.chord);
          const timeDelta = currentTime - block.time;

          // 이미 판정되었으면 건너뜀
          if (block.judged) return;

          if (Math.abs(timeDelta) <= TIMING_WINDOW) {
            if (top4Chords.includes(expected)) {
              block.state = "match";
              block.judged = true;
              console.log("✅ MATCH:", expected, "| top4:", top4Chords);
            } else {
              console.log("⏳ Waiting:", expected);
            }
          } else if (timeDelta > TIMING_WINDOW && !block.judged) {
            block.state = "miss";
            block.judged = true;
            console.log("❌ MISS (too late):", expected,"| primary:", primaryChord);
          }
        });

        const matchedBlock = blocksRef.current.find(block => block.state === "match");
        const finalChord = matchedBlock ? normalizeChord(matchedBlock.chord) : primaryChord || "---";
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
      // 상태 판정 로직은 onmessage 에서 처리하므로 여기서는 위치 업데이트 및 그리기만 수행

      if (!block.judged && currentTime - block.time > TIMING_WINDOW) {
        block.state = "miss";
        block.judged = true;
        console.log("❌ miss (no input)", normalizeChord(block.chord));
      }
    });

    draw();
    animationRef.current = requestAnimationFrame(update);
  };

  const start = () => {
    if (!canvasRef.current) return;
    stop();
    startTimeRef.current = Date.now();
    initializeBlocks();
    connectWebSocket();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
    animationRef.current = requestAnimationFrame(update);
  };

  const stop = () => {
    cancelAnimationFrame(animationRef.current);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send("stop");
      wsRef.current.close();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    wsRef.current = null;
    setDetectedChord("---");
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

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
