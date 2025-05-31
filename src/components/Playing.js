import React, { useEffect, useRef, useState, useCallback } from "react";
import "../styles/Playing.css";

// 상수 정의
const BLOCK_WIDTH = 50;
const BLOCK_HEIGHT = 30;
const SPEED = 100;
const CANVAS_WIDTH = 1000;
const JUDGE_X = CANVAS_WIDTH / 2;
const TIMING_WINDOW = 0.3;

// 유틸리티 함수
const normalizeChord = (chord) => {
  if (!chord || typeof chord !== "string") return "";
  chord = chord.trim().replace(/\s+/g, " ");
  const [root, type] = chord.split(" ");
  const displayType = type === "maj" ? "major" :
                     type === "min" ? "minor" : type;
  return `${root} ${displayType}`.trim();
};

const Playing = ({ chordTimeline, audioRef }) => {
  // Refs
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const blocksRef = useRef([]);
  const startTimeRef = useRef(null);
  const wsRef = useRef(null);
  const countdownRef = useRef(null);

  // State
  const [detectedChord, setDetectedChord] = useState("---");
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(null);

  // WebSocket 관련 함수
  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    wsRef.current = new WebSocket("ws://localhost:8000/ws/chordprac");

    wsRef.current.onopen = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send("start");
      }
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const currentTime = (Date.now() - startTimeRef.current) / 1000;

      if (!isWithinTimingWindow(currentTime)) {
        setDetectedChord("---");
        return;
      }

      if (data.top4_chords?.length > 0) {
        const top4Chords = data.top4_chords.map(normalizeChord);
        const primaryChord = normalizeChord(data.primary || "");

        blocksRef.current.forEach((block) => {
          if (block.judged) return;

          const expected = normalizeChord(block.chord);
          const timeDelta = currentTime - block.time;

          if (Math.abs(timeDelta) <= TIMING_WINDOW) {
            if (top4Chords.includes(expected)) {
              block.state = "match";
              block.judged = true;
            }
          } else if (timeDelta > TIMING_WINDOW) {
            block.state = "miss";
            block.judged = true;
          }
        });

        const matchedBlock = blocksRef.current.find(block => block.state === "match");
        setDetectedChord(matchedBlock ? normalizeChord(matchedBlock.chord) : primaryChord || "---");
      } else {
        setDetectedChord("---");
      }
    };
  };

  // 게임 로직 관련 함수
  const isWithinTimingWindow = (currentTime) => {
    return blocksRef.current.some(block => 
      Math.abs(currentTime - block.time) <= TIMING_WINDOW
    );
  };

  const initializeBlocks = useCallback(() => {
    blocksRef.current = chordTimeline.map(({ chord, time }) => ({
      chord,
      time,
      x: CANVAS_WIDTH + time * SPEED,
      judged: false,
      state: "pending"
    }));
  }, [chordTimeline]);

  // 렌더링 관련 함수
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 판정선 그리기
    ctx.fillStyle = "#888";
    ctx.fillRect(JUDGE_X - 2, 0, 4, canvas.height);

    // 블록 그리기
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

    if (!isPlaying) {
      animationRef.current = requestAnimationFrame(draw);
    }
  }, [isPlaying]);

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

  // 게임 제어 함수
  const startCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    
    setCountdown(3);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          startGame();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startGame = () => {
    if (!canvasRef.current || isPlaying) return;
    
    // 게임 시작 전 노드 상태 초기화
    blocksRef.current = blocksRef.current.map(block => ({
      ...block,
      judged: false,
      state: "pending"
    }));
    
    setIsPlaying(true);
    stop();
    startTimeRef.current = Date.now();
    connectWebSocket();
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
    
    animationRef.current = requestAnimationFrame(update);
  };

  const start = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    startCountdown();
  };

  const stop = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      setCountdown(null);
    }
    
    cancelAnimationFrame(animationRef.current);
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send("stop");
      wsRef.current.close();
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    wsRef.current = null;
    setDetectedChord("---");
    setIsPlaying(false);
  }, [audioRef]);

  // Effects
  useEffect(() => {
    initializeBlocks();
    draw();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [chordTimeline, draw, initializeBlocks]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return (
    <div className="playing-wrapper">
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={150}
          className="game-canvas"
        />
        {countdown !== null && (
          <div className="countdown">
            {countdown}
          </div>
        )}
      </div>
      <div className="control-buttons">
        <button onClick={start} className="control-button">시작</button>
        <button onClick={stop} className="control-button stop">정지</button>
      </div>
      <p className="detected-chord">감지된 코드: {detectedChord}</p>
    </div>
  );
};

export default Playing;
