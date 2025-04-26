import { useEffect, useRef } from "react";
import styles from "../styles/PracticeViewer.module.css";

const PracticeViewer = ({ gp5File }) => {
  const containerRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    if (gp5File && containerRef.current && window.alphaTab?.AlphaTabApi) {
      const api = new window.alphaTab.AlphaTabApi(containerRef.current, {
        file: gp5File,
        layoutMode: "horizontal",
        scrollMode: "horizontal",
        trackDisplayMode: "ScoreTab",
      });

      apiRef.current = api;

      return () => {
        api?.destroy();       // AlphaTab API 인스턴스 제거 (메모리 누수 방지)
      };
    }
  }, [gp5File]);

  return (
    <div className={styles.viewerContainer} >
      <div className={styles.viewerCanvas} ref={containerRef} />
    </div>
  );
};

export default PracticeViewer;
