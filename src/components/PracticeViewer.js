import React, {useEffect,useRef,forwardRef,useImperativeHandle,useState,} from "react";
import styles from "../styles/PracticeViewer.module.css";

const PracticeViewer = forwardRef(({ xmlFile, audioUrl, matchedNotes = [] }, ref) => {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const audioRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useImperativeHandle(ref, () => ({
    play: handlePlay,
    pause: handlePause,
    isReady: () => isReady,
    getError: () => error,
  }));

  const handlePlay = () => {
    if (audioRef.current && apiRef.current?.player) {
      audioRef.current.play();
      apiRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current && apiRef.current?.player) {
      audioRef.current.pause();
      apiRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleRestart = () => {
    if (audioRef.current && apiRef.current?.player) {
      audioRef.current.currentTime = 0;
      apiRef.current.player.stop();
      audioRef.current.play();
      apiRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (!window.alphaTab || !containerRef.current || !xmlFile) return;

    setError(null);
    setIsReady(false);

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const settings = {
      file: xmlFile,
      player: {
        enablePlayer: true,
        enableCursor: true,
        enablePlaybackCursor: true,
        enablePlaybackHighlighting: true,
        enablePlaybackSync: true,
        scrollElement: containerRef.current,
        scrollMode: "continuous",
        scrollOffset: 0.5, //의미 없음
        scrollSpeed: 0.5, // 의미 없음
      },
      display: {
        layoutMode: "horizontal",
        scale: 2,
      },
    };

    try {
      const api = new window.alphaTab.AlphaTabApi(containerRef.current, settings);
      apiRef.current = api;

      api.error.on((error) => {
        console.error("AlphaTab 에러:", error);
        setError(`악보 로딩 중 오류가 발생했습니다: ${error.message || error}`);
      });

      api.renderFinished.on(() => {
        setIsReady(true);
      });

      api.player.stateChanged.on((state) => {
        setIsPlaying(state === 1);
      });
      //*************강제 스크롤 코드**************
      api.player.positionChanged.on((args) => {
        const tick = args.tickPosition;
        if (tick != null && api.scrollToPosition) {
          api.scrollToPosition(tick);
        }
      });

      api.scoreLoaded.on(() => {
        containerRef.current.addEventListener("click", (e) => {
          const target = e.target.closest(".at-note, .at-beat, .at-bar");
          if (target?.dataset?.tick) {
            const tick = parseInt(target.dataset.tick, 10);
            if (!isNaN(tick)) {
              const time = api.player.tickToTime(tick);
              const wasPlaying = !audioRef.current.paused;

              //stop 먼저
              api.player.stop();
              audioRef.current.pause();

              //이동
              api.player.seek(tick);
              audioRef.current.currentTime = time;

              //다시 재생
              if (wasPlaying) {
                setTimeout(() => {
                  api.player.play();
                  audioRef.current.play();
                }, 50); // 약간의 지연을 주면 sync가 더 안정됨
              }
            }
          }
        });
      });

    } catch (error) {
      console.error("AlphaTab 초기화 실패:", error);
      setError(`악보 뷰어 초기화에 실패했습니다: ${error.message}`);
    }

    return () => {
      apiRef.current?.destroy();
    };
  }, [xmlFile, audioUrl]);

  // 커서 스타일
  useEffect(() => {
    const interval = setInterval(() => {
      const cursor = document.querySelector(".at-cursor-beat");
      if (cursor) {
        cursor.style.background = "rgb(255, 0, 0)";
        cursor.style.borderRadius = "4px";
      }

      document.querySelectorAll(".at-note, .at-beat").forEach((el) => {
        const tick = parseInt(el.dataset.tick, 10);
        if (!isNaN(tick)) {
          const match = matchedNotes.find((m) => m.tick === tick);
          if (match) {
            let marker = el.querySelector(".note-status-marker");
            if (!marker) {
              marker = document.createElement("div");
              marker.className = "note-status-marker";
              el.appendChild(marker);
            }
            marker.style.position = "absolute";
            marker.style.top = "-10px";
            marker.style.left = "0";
            marker.style.width = "8px";
            marker.style.height = "8px";
            marker.style.borderRadius = "50%";
            marker.style.backgroundColor = match.correct ? "green" : "red";
          }
        }
      });
    }, 200);

    return () => clearInterval(interval);
  }, [matchedNotes]);

  if (error) {
    return (
      <div className={styles.viewerContainer}>
        <div className={styles.errorContainer}>
          <h3>⚠️ 오류 발생</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            페이지 새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.viewerContainer}>
      {!isReady && (
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>악보를 불러오는 중...</p>
        </div>
      )}
      <div
        className={styles.viewerCanvas}
        ref={containerRef}
        style={{
          opacity: isReady ? 1 : 0.3,
          overflowX: "auto",
          overflowY: "hidden",
          width: "100%",
          whiteSpace: "nowrap",
        }}
      />
      {isReady && (
        <div className={styles.controlButtons} style={{ marginTop: "10px", textAlign: "center" }}>
          <button onClick={handlePlay} disabled={isPlaying} style={{ marginRight: "10px" }}>
            재생
          </button>
          <button onClick={handlePause} disabled={!isPlaying} style={{ marginRight: "10px" }}>
            일시정지
          </button>
          <button onClick={handleRestart}>
            다시하기
          </button>
        </div>
      )}
    </div>
  );
});

export default PracticeViewer;
