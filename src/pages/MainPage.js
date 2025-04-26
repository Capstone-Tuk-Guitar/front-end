import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Card from "../components/Card";
import styles from "../styles/MainPage.module.css";
import DetailChord from "../components/DetailChord";

import musicImage from "../assets/music.svg";
import guitarImage from "../assets/guitar.svg";
import recordImage from "../assets/stats.svg";
import compareImage from "../assets/compare.svg";

// 이미지 자동 import
const importAll = (r) => r.keys().map(r);
const chordImages = importAll(
  require.context("../assets/ChordPhoto", false, /\.(png)$/)
);

const MainPage = () => {
  const [activeIndex, setActiveIndex] = useState(1); // 중앙 슬라이드 인덱스
  const [selectedChord, setSelectedChord] = useState(null); // 선택한 코드 이미지 저장
  const [randomChords, setRandomChords] = useState([]);

  const slides = [
    { id: 0, image: musicImage, text: "음원 목록" },
    { id: 1, image: guitarImage, text: "연주하기" },
    { id: 2, image: compareImage, text: "비교하기"},
    { id: 3, image: recordImage, text: "연주 기록" },
  ];

  useEffect(() => {
    // 이미지 배열을 셔플해서 3개 선택
    const shuffled = [...chordImages].sort(() => 0.5 - Math.random());
    setRandomChords(shuffled.slice(0, 3));
  }, []);

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  return (
    <div className="container">
      <Header />

      <div className={styles.container}>
        <div className={styles.slider}>
          <button className={styles.arrowButton} onClick={handlePrev}>
            ❮
          </button>

          <div className={styles.slide}>
            {slides.map((slide, index) => (
              <Card
                key={slide.id}
                image={slide.image}
                text={slide.text}
                isActive={index === activeIndex}
                position={index - activeIndex} // 활성화 상태와 위치를 기준으로 스타일 조정
              />
            ))}
          </div>

          <button className={styles.arrowButton} onClick={handleNext}>
            ❯
          </button>
        </div>

        <div className={styles.pagination}>
          {slides.map((_, index) => (
            <span
              key={index}
              className={`${styles.dot} ${index === activeIndex ? styles.active : ""}`}
              onClick={() => setActiveIndex(index)}
            ></span>
          ))}
        </div>
      </div>

      {/* 운지 이미지 랜덤 표시 */}
      <div className={styles.fingering}>
        {randomChords.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Chord ${index}`}
            className={styles.fingeringImage}
            onClick={() => setSelectedChord(img)}
          />
        ))}
      </div>

      {selectedChord && <DetailChord chordImage={selectedChord} onClose={() => setSelectedChord(null)} />}
    </div>
  );
};

export default MainPage;
