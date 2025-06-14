import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react";
import styles from "../styles/PracticeViewer.module.css";

const PracticeViewer = forwardRef(({ xmlFile, audioRef }, ref) => {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useImperativeHandle(ref, () => ({
    play: handlePlay,
    stop: handleStop,
    handleRestart: handleRestart,
    isReady: () => isReady,
    getError: () => error,
  }));

  const handlePlay = () => {
    if (apiRef.current?.player) {
      apiRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (apiRef.current?.player) {
      apiRef.current.player.stop();
      setIsPlaying(false);
    }
  };

  const handleRestart = () => {
    if (apiRef.current?.player) {
      apiRef.current.player.stop();
      apiRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (!window.alphaTab || !containerRef.current || !xmlFile) return;

    setError(null);
    setIsReady(false);

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
        scrollOffset: 0.5,
        scrollSpeed: 0.5,
      },
      display: {
        layoutMode: "horizontal",
        scale: 1.2,
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

              api.player.stop();
              audioRef.current.pause();

              api.player.seek(tick);
              audioRef.current.currentTime = time;

              if (wasPlaying) {
                setTimeout(() => {
                  api.player.play();
                  audioRef.current.play();
                }, 50);
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
  }, [xmlFile, audioRef]);

  // 커서 스타일
  useEffect(() => {
    const interval = setInterval(() => {
      const cursor = document.querySelector(".at-cursor-beat");
      if (cursor) {
        cursor.style.background = "rgb(255, 0, 0)";
        cursor.style.borderRadius = "4px";
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

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
    </div>
  );
});

export default PracticeViewer;
