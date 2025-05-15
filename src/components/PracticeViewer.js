import { useEffect, useRef } from "react";
import styles from "../styles/PracticeViewer.module.css";

const PracticeViewer = ({ xmlFile }) => {
  const containerRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    if (xmlFile && containerRef.current && window.alphaTab?.AlphaTabApi) {
      const api = new window.alphaTab.AlphaTabApi(containerRef.current, {
        file: xmlFile,
        layoutMode: "horizontal",
        scrollMode: "horizontal",
        trackDisplayMode: "ScoreTab",
        scale: 2.5,
      });

      apiRef.current = api;

      api.renderFinished.on(() => {
        const canvas = containerRef.current.querySelector("div");
        if (canvas) {
          containerRef.current.style.width = `${canvas.scrollWidth}px`;  // 자동으로 맞춰줌
        }
      });

      return () => {
        api?.destroy();       // AlphaTab API 인스턴스 제거 (메모리 누수 방지)
      };
    }
  }, [xmlFile]);

  return (
    <div className={styles.viewerContainer} >
      <div className={styles.viewerCanvas} ref={containerRef} />
    </div>
  );
};

export default PracticeViewer;
