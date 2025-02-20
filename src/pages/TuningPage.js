import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "../styles/TuningPage.module.css"; 
import Header from "../components/Header";

// fender 이미지를 직접 import
import fenderImage from "../assets/guitarhead.png";

export const TuningPage = ({ className, fender = fenderImage }) => {
  const [frequency, setFrequency] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setFrequency(data.frequency.toFixed(2));
      setNote(data.note);
    };

    return () => ws.close();
  }, []);

  return (
    <div className="container">
      <Header />
    <div className={`${styles.divWrapper} ${className}`}>
      <div className={styles.overlap}>
        <div className={styles.overlapGroup}>
          <img className={styles.fender} alt="Fender" src={fender} />  
          {/* 줄에 표시된 텍스트 및 그림*/}
          <div className={styles.ellipse1} />
          <div className={styles.ellipse2} />
          <div className={styles.ellipse3} />
          <div className={styles.ellipse4} />
          <div className={styles.ellipse5} />
          <div className={styles.ellipse6} />
          
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

      {/*정사각형 음 화면*/}
      <div className={styles.centerSquare}>
        <span className={styles.squareText}>{note || "—"}</span>
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
