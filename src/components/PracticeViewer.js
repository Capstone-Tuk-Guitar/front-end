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
        renderTitle: false,
        renderMeasureNumbers: false,
        coreDisplayCopyright: false,
        display: {
          lyrics: false,
          chordDiagrams: false,
          directions: false,
          techniqueText: false,
          customText: false,
        }
      });

      apiRef.current = api;

      const scrollToStart = () => {
        try {
          api.view?.scrollToX?.(0);
        } catch (e) {
          console.warn("스크롤 초기화 실패:", e);
        }
      };

      api.scoreLoaded?.on(scrollToStart);

      return () => {
        api.scoreLoaded?.off?.(scrollToStart);
        URL.revokeObjectURL(xmlFile);
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
