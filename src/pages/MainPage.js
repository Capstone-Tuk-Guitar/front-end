import React, { useState, useEffect, useMemo, useCallback } from "react";
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
const allChordImages = importAll(
  require.context("../assets/ChordPhoto", false, /\.(png)$/)
);

const MainPage = () => {
  const [activeIndex, setActiveIndex] = useState(1); // 중앙 슬라이드 인덱스
  const [selectedChord, setSelectedChord] = useState(null); // 선택한 코드 이미지 저장
  const [randomChords, setRandomChords] = useState([]);

  // 슬라이드 데이터를 useMemo로 메모이제이션
  const slides = useMemo(() => [
    { id: 0, image: musicImage, text: "음원 목록" },
    { id: 1, image: guitarImage, text: "연주하기" },
    { id: 2, image: compareImage, text: "비교하기"},
    { id: 3, image: recordImage, text: "연주 기록" },
  ], []);

  // 랜덤 코드 이미지 선택 (성능 최적화)
  useEffect(() => {
    if (allChordImages.length > 0) {
      // 이미 로드된 이미지 배열에서 랜덤하게 3개 선택
      const shuffledImages = [...allChordImages].sort(() => 0.5 - Math.random());
      setRandomChords(shuffledImages.slice(0, 3));
    }
  }, []);

  // 콜백 함수 메모이제이션
  const handleNext = useCallback(() => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleChordClick = useCallback((img) => {
    setSelectedChord(img);
  }, []);

  const handleCloseChord = useCallback(() => {
    setSelectedChord(null);
  }, []);

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

      {/* 운지법 이미지 랜덤 표시 */}
      <div className={styles.fingering}>
        {randomChords.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Chord ${index}`}
            className={styles.fingeringImage}
            onClick={() => handleChordClick(img)}
            loading="lazy"
          />
        ))}
      </div>

      {selectedChord && <DetailChord chordImage={selectedChord} onClose={handleCloseChord} />}
    </div>
  );
};

export default MainPage;
