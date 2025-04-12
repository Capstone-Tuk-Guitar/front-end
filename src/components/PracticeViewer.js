import { useEffect, useRef } from "react";

const PracticeViewer = ({ xmlFile }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (xmlFile && containerRef.current && window.alphaTab?.AlphaTabApi) {
      const api = new window.alphaTab.AlphaTabApi(containerRef.current, {
        file: xmlFile,
        layoutMode: "horizontal",
        scrollMode: "horizontal",
        trackDisplayMode: "ScoreTab",
      });

      return () => {
        URL.revokeObjectURL(xmlFile);
      };
    }
  }, [xmlFile]);

  return (
    <div style={{ overflowX: "auto", border: "1px solid #ccc", marginTop: "20px" }}>
      <div ref={containerRef} style={{ width: "3000px", height: "400px" }} />
    </div>
  );
};

export default PracticeViewer;
