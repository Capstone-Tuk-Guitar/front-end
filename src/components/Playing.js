import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import "../styles/Playing.module.css";

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
  const [isPlaying, setIsPlaying] = useState(false);

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

      if (!block.judged && currentTime - block.time > TIMING_WINDOW) {
        block.state = "miss";
        block.judged = true;
      }
    });

    draw();
    animationRef.current = requestAnimationFrame(update);
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
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
    
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
    return () => stop();
  }, [stop]);

  return (
    <div className="playing-wrapper">
      <div className="canvas-container">
        <canvas
          className="game-canvas"
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={150}
        />
      </div>
    </div>
  );
});

export default Playing;
