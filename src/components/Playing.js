import React, {useEffect,useRef,useState,useCallback,forwardRef,useImperativeHandle} from "react";
import styles from "../styles/Playing.module.css";

const BLOCK_WIDTH = 50;
const BLOCK_HEIGHT = 30;
const SPEED = 100;
const CANVAS_WIDTH = 1000;
const JUDGE_X = CANVAS_WIDTH / 2;
const TIMING_WINDOW = 0.4;

const normalizeChord = (chordStr) => {
  if (!chordStr || chordStr === "---") return "---";
  if (!chordStr || typeof chordStr !== "string") return "";
  chordStr = chordStr.trim().replace(/\s+/g, " ");
  const [root, type] = chordStr.split(" ");
  const displayType =
    type === "maj" ? "major" : type === "min" ? "minor" : type;
  return `${root} ${displayType}`.trim();
};

const Playing = forwardRef(({ chordTimeline, audioRef }, ref) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const blocksRef = useRef([]);
  const startTimeRef = useRef(null);
  const wsRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [detectedChord, setDetectedChord] = useState("---");

  // WebSocket 연결
  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    wsRef.current = new WebSocket("ws://localhost:8000/ws/chordprac");

    wsRef.current.onopen = () => {
      wsRef.current?.send("start");
    };

   wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const top4 = data.top4_chords || [];
      const normalizedTop4 = top4.map(normalizeChord);
      const primaryChord = normalizeChord(data.primary || "---");

      const currentTime = (Date.now() - startTimeRef.current) / 1000;

      let matchedChord = null;

      blocksRef.current.forEach((block) => {
        if (
          !block.judged &&
          Math.abs(currentTime - block.time) <= TIMING_WINDOW
        ) {
          const normalizedBlockChord = normalizeChord(block.chord);
          if (normalizedTop4.includes(normalizedBlockChord)) {
            block.matchedblock.push(normalizedBlockChord);
            matchedChord = normalizedBlockChord;
          }
        }
      });

      //매칭된 코드가 있으면 그것을 표시, 없으면 primary 표시
      setDetectedChord(matchedChord || primaryChord);
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
      state: "pending",
      matchedblock: [],
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
        miss: "#f87171",
      };

      ctx.fillStyle = colorMap[block.state] || "#94a3b8";
      ctx.fillRect(
        block.x,
        canvas.height / 2 - BLOCK_HEIGHT / 2,
        BLOCK_WIDTH,
        BLOCK_HEIGHT
      );

      ctx.fillStyle = "#fff";
      ctx.font = "18px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        block.chord,
        block.x + BLOCK_WIDTH / 2,
        canvas.height / 2 + 6
      );
    });
  }, []);

  const update = () => {
    const currentTime = (Date.now() - startTimeRef.current) / 1000;

    blocksRef.current.forEach((block) => {
      block.x =
        JUDGE_X + (block.time - currentTime) * SPEED - BLOCK_WIDTH / 2;

      const timeDiff = currentTime - block.time;

      if (!block.judged && timeDiff > TIMING_WINDOW) {
        const normalizedBlockChord = normalizeChord(block.chord);
        const matchedNormalized = block.matchedblock.map(normalizeChord);

        if (matchedNormalized.includes(normalizedBlockChord)) {
          block.state = "match";
        } else {
          block.state = "miss";
        }
        block.judged = true;
      }
    });

    draw();
    animationRef.current = requestAnimationFrame(update);
  };

  const startGame = async () => {
    if (!canvasRef.current || isPlaying) return;

    blocksRef.current = blocksRef.current.map((block) => ({
      ...block,
      judged: false,
      state: "pending",
      matchedblock: [],
    }));

    setIsPlaying(true);
    stop();

    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;

        await audioRef.current.play();
        startTimeRef.current = Date.now();
      }

      connectWebSocket();
      animationRef.current = requestAnimationFrame(update);
    } catch (e) {
      console.error("오디오 재생 실패:", e);
    }
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

    disconnectWebSocket();
    setIsPlaying(false);
  }, [audioRef]);

  useImperativeHandle(ref, () => ({
    start,
    stop,
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
