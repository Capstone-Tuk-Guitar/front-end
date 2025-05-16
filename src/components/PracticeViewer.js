import React, { useEffect, useRef } from "react";
import styles from "../styles/PracticeViewer.module.css";

const PracticeViewer = ({ xmlFile }) => {
  const containerRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    if (!window.alphaTab || !containerRef.current || !xmlFile) return;

    const settings = {
        file: xmlFile,
        player: {
            enablePlayer: true,
            enableCursor: true,
        },
        display: {
            layoutMode: "horizontal",
            autoScroll: true,
            drawTitle: true,
            scale: 1.8,
        },
    };

    const api = new window.alphaTab.AlphaTabApi(containerRef.current, settings);
    apiRef.current = api;

    api.renderFinished.on(() => {
        const canvas = containerRef.current.querySelector("div");
        if (canvas) {
            containerRef.current.style.width = `${canvas.scrollWidth}px`;  // 자동으로 맞춰줌
        }
    });

    // clean up
    return () => {
        api?.destroy();       // AlphaTab API 인스턴스 제거 (메모리 누수 방지)
    };
  }, [xmlFile]);

  return (
    <div className={styles.viewerContainer} >
        <div className={styles.viewerCanvas} ref={containerRef} />
    </div>
  );
};

export default PracticeViewer;
