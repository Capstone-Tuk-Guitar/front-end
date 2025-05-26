import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react";
import styles from "../styles/PracticeViewer.module.css";

const PracticeViewer = forwardRef(({ xmlFile, audioUrl }, ref) => {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const audioRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useImperativeHandle(ref, () => ({
    play: () => {
      audioRef.current?.play();
      apiRef.current?.play();
    },
    pause: () => {
      audioRef.current?.pause();
      apiRef.current?.pause();
    },
    isReady: () => isReady,
    getError: () => error
  }));

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
            scrollSpeed: 0.5,
            scrollOffset: 0.3
        },
        display: {
            layoutMode: "horizontal",
            scale: 2
        },
    };

    try {
      const api = new window.alphaTab.AlphaTabApi(containerRef.current, settings);
      apiRef.current = api;

      // 에러 처리
      api.error.on((error) => {
        console.error("AlphaTab 에러:", error);
        setError(`악보 로딩 중 오류가 발생했습니다: ${error.message || error}`);
      });

      // 렌더 완료 시점
      api.renderFinished.on(() => {
        const canvas = containerRef.current.querySelector("div");
        if (canvas) {
          // 캔버스 너비 설정
          const canvasWidth = canvas.scrollWidth;
          containerRef.current.style.width = `${canvasWidth}px`;
          
          // 스크롤 위치 초기화
          containerRef.current.scrollLeft = 0;
          
          // 스크롤 이벤트 리스너 추가
          containerRef.current.addEventListener('scroll', () => {
            const scrollLeft = containerRef.current.scrollLeft;
            const maxScroll = canvasWidth - containerRef.current.clientWidth;
            
            // 스크롤이 끝에 도달했을 때 처리
            if (scrollLeft >= maxScroll) {
              console.log('스크롤 끝에 도달');
            }
          });
        }
        setIsReady(true);
        console.log("api.player 상태:", api.player);
        
        // 재생 위치 변경 이벤트
        api.player.positionChanged.on(() => {
          console.log("재생 위치 변경됨");
        });

        // 상태 변경 이벤트
        api.player.stateChanged.on((state) => {
          console.log("재생 상태 변경:", state);
          if (state === 1) { }          // 재생 중
          else if (state === 0) { }     // 일시정지
        });
      });

    } catch (error) {
      console.error("AlphaTab 초기화 실패:", error);
      setError(`악보 뷰어 초기화에 실패했습니다: ${error.message}`);
    }

    // clean up
    return () => {
      apiRef.current?.destroy();       // AlphaTab API 인스턴스 제거 (메모리 누수 방지)
    };
  }, [xmlFile, audioUrl]);

  useEffect(() => {
    // 50ms마다 커서에 스타일 강제 적용
    const interval = setInterval(() => {
      const cursor = document.querySelector('.at-cursor-beat');
      if (cursor) {
        cursor.style.background = 'rgb(255, 0, 0)';
        cursor.style.borderRadius = '4px';
      }
    }, 50);
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
          overflowX: 'auto',
          width: '100%'
        }}
      />
    </div>
  );
});

export default PracticeViewer;
