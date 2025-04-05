import { useEffect, useRef } from "react";

const PracticeViewer = ({ musicXmlFile }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (musicXmlFile && containerRef.current) {
      const objectUrl = URL.createObjectURL(musicXmlFile);
      const api = new window.alphaTab.AlphaTabApi(containerRef.current, {
        file: objectUrl,
        layoutMode: "horizontal",       // 가로 레이아웃
        scrollMode: "horizontal",       // 자동 스크롤 모드
        trackDisplayMode: "ScoreTab",   // TAB + 오선 악보 모두 표시
      });

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [musicXmlFile]);

  return (
    <div style={{ overflowX: "auto", border: "1px solid #ccc", marginTop: "20px" }}>
      <div ref={containerRef} style={{ width: "3000px", height: "400px" }} />
    </div>
  );
};

export default PracticeViewer;