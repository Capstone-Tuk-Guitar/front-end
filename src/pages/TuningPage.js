import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "../styles/TuningPage.module.css"; 
import Header from "../components/Header";
import Button from "../components/Button";
import { FaQuestionCircle } from "react-icons/fa";
import { useTour, TourOverlay } from "../components/TourHelper";

// fender 이미지를 직접 import
import fenderImage from "../assets/guitarhead.png";

const correctNotes = {
  E: "ellipse6",  // 6번 줄 (저음 E)
  A: "ellipse5",  // 5번 줄 (A)
  D: "ellipse4",  // 4번 줄 (D)
  G: "ellipse3",  // 3번 줄 (G)
  B: "ellipse2",  // 2번 줄 (B)
  "E_high": "ellipse1",  // 1번 줄 (고음 E)
};

export const TuningPage = ({ className, fender = fenderImage }) => {
  const [frequency, setFrequency] = useState(null);
  const [note, setNote] = useState("");
  const [activeString, setActiveString] = useState(null); // 현재 튜닝 중인 줄
  
  const tourSteps = [
    {
      target: "centerSquare",
      title: "음/주파수 영역",
      description: "현재 감지된 음과 주파수를 이 영역에서 확인할 수 있습니다.",
      top: -320,
    },
    {
      target: "guitarVisual",
      title: "기타 헤드 & 줄",
      description: "각 줄에 맞게 조율하세요. \n <페그 사용법> \n 몸쪽으로 돌리면 음이 올라가고 \n 기타 헤드쪽으로 돌리면 음이 내려갑니다.",
      top: -320,
    },
  ];

  const {
    isTourActive,
    tourStep,
    tooltipPosition,
    startTour,
    nextTourStep,
    prevTourStep,
    endTour,
    getHighlightClass,
  } = useTour(tourSteps);


  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const receivedNote = data.note;
      const freq = parseFloat(data.frequency);

      setFrequency(freq.toFixed(2));
      setNote(receivedNote);

      // 올바른 음이면 해당 줄 강조
      if (receivedNote === "E") {
        if (freq > 300) {
          setActiveString("ellipse1");  // 고음 E
        } else {
          setActiveString("ellipse6");  // 저음 E
        }
      } else if (correctNotes[receivedNote]) {
        setActiveString(correctNotes[receivedNote]);
      } else {
        setActiveString(null);
      }
    };

    return () => ws.close();
  }, []);

    return (
    <div className="container">
      <Header />

      {/* 도움말 버튼 */}
      <div className={styles.helpButtonContainer}>
        <Button
          className={styles.helpButton}
          onClick={startTour}
          icon={FaQuestionCircle}
        >
          도움말
        </Button>
      </div>

      {/* 튜닝 화면 */}
      <div className={`${styles.divWrapper} ${className || ""}`}>        
        {/* 1) 음/주파수 표시 영역: directly assign to centerSquare */}
        <div
          id="centerSquare"
          className={`${styles.centerSquare} ${getHighlightClass("centerSquare")}`}
        >
          <span
            className={styles.squareText}
            style={{ color: activeString ? "#2df43b" : "black" }}
          >
            {note || "—"}
          </span>
          <span className={styles.squarefre}>
            {frequency ? `${frequency} Hz` : "—"}
          </span>
        </div>

        {/* 2) 기타 헤드 & 줄 비주얼 영역 */}
        <div
          id="guitarVisual"
          className={`${styles.overlap} ${getHighlightClass("guitarVisual")}`}
        >
          <img className={styles.fender} alt="Fender" src={fender} />

          {/* 줄에 표시된 텍스트 및 그림 */}
          <div className={styles.ellipse1} />
          <div className={styles.ellipse2} />
          <div className={styles.ellipse3} />
          <div className={styles.ellipse4} />
          <div className={styles.ellipse5} />
          <div className={styles.ellipse6} />

          {/* 줄 배경 변경 */}
          {["ellipse1","ellipse2","ellipse3","ellipse4","ellipse5","ellipse6"].map((el) => (
            <div
              key={el + "-highlight"}
              className={styles[el]}
              style={{
                backgroundColor:
                  activeString === el ? "#2df43b" : "transparent",
              }}
            />
          ))}

          {/* 텍스트 레이블 */}
          <div className={styles.textWrapper1}>1번 줄</div>
          <div className={styles.textWrapper2}>2번 줄</div>
          <div className={styles.textWrapper3}>3번 줄</div>
          <div className={styles.textWrapper4}>4번 줄</div>
          <div className={styles.textWrapper5}>5번 줄</div>
          <div className={styles.textWrapper6}>6번 줄</div>
          <div className={styles.textWrapper11}>E</div>
          <div className={styles.textWrapper21}>B</div>
          <div className={styles.textWrapper31}>G</div>
          <div className={styles.textWrapper41}>D</div>
          <div className={styles.textWrapper51}>A</div>
          <div className={styles.textWrapper61}>E</div>
        </div>
      </div>

      {/* 투어 오버레이 */}
      <TourOverlay
        isTourActive={isTourActive}
        tourStep={tourStep}
        tooltipPosition={tooltipPosition}
        tourSteps={tourSteps}
        endTour={endTour}
        prevTourStep={prevTourStep}
        nextTourStep={nextTourStep}
      />
    </div>
  );
};

TuningPage.propTypes = {
  className: PropTypes.string,
  fender: PropTypes.string,
};

export default TuningPage;