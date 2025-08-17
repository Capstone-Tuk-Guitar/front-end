import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "../styles/GuitarHead.module.css";

const stringIds = ["ellipse1", "ellipse2", "ellipse3", "ellipse4", "ellipse5", "ellipse6"];

const BASE_W = 655;
const BASE_H = 673.5;

const GuitarHead = ({
  fenderImage,
  guitar2,
  getHighlightClass,
  onPrevImage,
  onNextImage,
  selectedString,
  tunedStrings = [],
}) => {
  const isSecondImage = fenderImage === guitar2;
  const outerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (!outerRef.current) return;
      const w = outerRef.current.clientWidth; // 가용 너비
      const s = Math.max(0.5, Math.min(1.5, w / BASE_W)); // 축소 확대 방지
      setScale(s);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scaledHeight = BASE_H * scale;

  return (
    <div
      id="guitarhead"
      ref={outerRef}
      className={`${styles.overlap} ${getHighlightClass("guitarhead")}`}
      style={{ height: `${scaledHeight}px` }} 
    >
      <div
        className={styles.board}
        style={{ transform: `scale(${scale})` }}
      >
        <div className={styles.statusLegend}>
          <span className={styles.redDot}>●</span> : 튜닝 필요&nbsp;
          <span className={styles.blueDot}>●</span> : 측정 중&nbsp;
          <span className={styles.greenDot}>●</span> : 튜닝 완료
        </div>

        <img
          className={`${styles.fender} ${isSecondImage ? styles.fenderShiftLeft : ""}`}
          alt="Fender"
          src={fenderImage}
        />

        {stringIds.map((id, index) => {
          const stringNum = String(6 - index);
          const isTuned = tunedStrings.includes(stringNum);
          let bgColor = "#d9d9d9";

          if (selectedString === "all") {
            bgColor = isTuned ? "#2df43b" : "red";
          } else if (selectedString === stringNum) {
            bgColor = isTuned ? "#2df43b" : "red";
          }

          return (
            <div
              key={id}
              className={`${styles[id]} ${isSecondImage ? styles[`${id}Shift`] : ""}`}
              style={{ backgroundColor: bgColor }}
            />
          );
        })}

        {[1, 2, 3, 4, 5, 6].map((num) => {
          const stringNum = String(num);
          const isTuned = tunedStrings.includes(stringNum);
          let textColor = "black";
          let fontWeight = "normal";

          if (selectedString === "all") {
            textColor = isTuned ? "green" : "red";
            fontWeight = isTuned ? "bold" : "normal";
          } else if (selectedString === stringNum) {
            textColor = isTuned ? "green" : "red";
            fontWeight = isTuned ? "bold" : "normal";
          }

          return (
            <div
              key={`label${num}`}
              className={`${styles[`textWrapper${num}`]} ${isSecondImage ? styles[`textWrapper${num}Shift`] : ""}`}
              style={{ color: textColor, fontWeight }}
            >
              {num}번 줄
            </div>
          );
        })}

        <div className={`${styles.textWrapper11} ${isSecondImage ? styles.textWrapper11Shift : ""}`}>E</div>
        <div className={`${styles.textWrapper21} ${isSecondImage ? styles.textWrapper21Shift : ""}`}>B</div>
        <div className={`${styles.textWrapper31} ${isSecondImage ? styles.textWrapper31Shift : ""}`}>G</div>
        <div className={`${styles.textWrapper41} ${isSecondImage ? styles.textWrapper41Shift : ""}`}>D</div>
        <div className={`${styles.textWrapper51} ${isSecondImage ? styles.textWrapper51Shift : ""}`}>A</div>
        <div className={`${styles.textWrapper61} ${isSecondImage ? styles.textWrapper61Shift : ""}`}>E</div>

        <button className={styles.arrowLeft} onClick={onPrevImage}>⟨</button>
        <button className={styles.arrowRight} onClick={onNextImage}>⟩</button>
      </div>
    </div>
  );
};

GuitarHead.propTypes = {
  fenderImage: PropTypes.string.isRequired,
  guitar2: PropTypes.string.isRequired,
  activeString: PropTypes.string,
  getHighlightClass: PropTypes.func.isRequired,
  onPrevImage: PropTypes.func.isRequired,
  onNextImage: PropTypes.func.isRequired,
  selectedString: PropTypes.string,
  tunedStrings: PropTypes.arrayOf(PropTypes.string),
};

export default GuitarHead;