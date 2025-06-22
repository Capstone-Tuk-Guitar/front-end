import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import styles from "../styles/Playing.module.css";

// 상수 정의
const BLOCK_WIDTH = 50;
const BLOCK_HEIGHT = 30;
const SPEED = 100;
const CANVAS_WIDTH = 1000;
const JUDGE_X = CANVAS_WIDTH / 2;
const TIMING_WINDOW = 0.3;

const Playing = forwardRef(({ chordTimeline, audioRef }, ref) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const blocksRef = useRef([]);
  const startTimeRef = useRef(null);
  const wsRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [detectedChord, setDetectedChord] = useState("---");

  // WebSocket 연결 및 코드 감지
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
      if (data.top4_chords?.length > 0) {
        const primaryChord = data.primary || "---";
        setDetectedChord(primaryChord);
      } else {
        setDetectedChord("---");
      }
    };
  };

  const disconnectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send("stop");
      wsRef.current.close();
    }
    wsRef.current = null;
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

  const draw = useCallback(() => {
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

    if (!isPlaying) {
      animationRef.current = requestAnimationFrame(draw);
    }
  }, [isPlaying]);

  const update = () => {
    const currentTime = (Date.now() - startTimeRef.current) / 1000;

    blocksRef.current.forEach((block) => {
      block.x = JUDGE_X + (block.time - currentTime) * SPEED - BLOCK_WIDTH / 2;

      // 감지된 코드와 현재 블록의 코드가 일치하고, 타이밍 윈도우 내에 있는지 확인
      if (!block.judged && 
          Math.abs(currentTime - block.time) <= TIMING_WINDOW && 
          detectedChord === block.chord) {
        block.state = "match";
        block.judged = true;
      }
      // 타이밍 윈도우를 벗어났고 아직 판정되지 않은 경우
      else if (!block.judged && currentTime - block.time > TIMING_WINDOW) {
        block.state = "miss";
        block.judged = true;
      }
    });

    draw();
    animationRef.current = requestAnimationFrame(update);
  };

  const startGame = () => {
    if (!canvasRef.current || isPlaying) return;
    
    blocksRef.current = blocksRef.current.map(block => ({
      ...block,
      judged: false,
      state: "pending"
    }));
    
    setIsPlaying(true);
    stop();
    startTimeRef.current = Date.now();
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
    
    // WebSocket 연결
    connectWebSocket();
    
    animationRef.current = requestAnimationFrame(update);
  };

  const start = () => {
    startGame();
  };

  const stop = useCallback(() => {
    cancelAnimationFrame(animationRef.current);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // WebSocket 연결 해제
    disconnectWebSocket();
    
    setIsPlaying(false);
  }, [audioRef]);

  useImperativeHandle(ref, () => ({
    start: start,
    stop: stop
  }));

  useEffect(() => {
    initializeBlocks();
    draw();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [chordTimeline, draw, initializeBlocks]);

  useEffect(() => {
    return () => {
      stop();
      disconnectWebSocket();
    };
  }, [stop]);

  return (
    <div className={styles.playing_wrapper}>
      <div className={styles.canvas_container}>
        <canvas
          className={styles.game_canvas}
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={150}
        />
      </div>
      <div className={styles.detectedChord}>
        현재 입력 코드: {detectedChord}
      </div>
    </div>
  );
});

export default Playing;
