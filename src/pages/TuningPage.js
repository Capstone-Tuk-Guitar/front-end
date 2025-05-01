import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "../styles/TuningPage.module.css"; 
import Header from "../components/Header";

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
      
      <div className={`${styles.divWrapper} ${className}`}>
        <div className={styles.overlap}>
          <img className={styles.fender} alt="Fender" src={fender} />  
          {/* 줄에 표시된 텍스트 및 그림*/}
          <div className={styles.ellipse1} />
          <div className={styles.ellipse2} />
          <div className={styles.ellipse3} />
          <div className={styles.ellipse4} />
          <div className={styles.ellipse5} />
          <div className={styles.ellipse6} />

          {/* 줄 배경 변경 */}
          {["ellipse1", "ellipse2", "ellipse3", "ellipse4", "ellipse5", "ellipse6"].map((el, idx) => (
              <div 
                key={el} 
                className={styles[el]} 
                style={{ backgroundColor: activeString === el ? "#2df43b" : "#d9d9d9" }}
              />
            ))}
          
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

        {/*정사각형 음 화면*/}
        <div className={styles.centerSquare}>
        <span 
            className={styles.squareText} 
            style={{ color: activeString ? "#2df43b" : "black" }}
          >
            {note || "—"}
          </span>
          <span className={styles.squarefre}>{frequency ? `${frequency} Hz` : "—"}</span>
        </div>
      </div>
    </div>
  );
};

// PropTypes로 prop 타입을 정의
TuningPage.propTypes = {
  className: PropTypes.string,
  fender: PropTypes.string,
};

// 기본 내보내기
export default TuningPage;