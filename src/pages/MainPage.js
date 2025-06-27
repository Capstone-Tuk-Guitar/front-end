import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  // localStorage에서 마지막 클릭한 카드 인덱스를 가져오거나 기본값 1 사용
  const [activeIndex, setActiveIndex] = useState(() => {
    const savedIndex = localStorage.getItem('lastClickedCardIndex');
    return savedIndex ? parseInt(savedIndex, 10) : 1;
  });
  const [selectedChord, setSelectedChord] = useState(null); // 선택한 코드 이미지 저장
  const [randomChords, setRandomChords] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false); // 애니메이션 진행 상태

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
    if (isAnimating) return;
    setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length, isAnimating]);

  const handlePrev = useCallback(() => {
    if (isAnimating) return;
    setActiveIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  }, [slides.length, isAnimating]);

  const handleChordClick = useCallback((img) => {
    setSelectedChord(img);
  }, []);

  const handleCloseChord = useCallback(() => {
    setSelectedChord(null);
  }, []);

  // 카드 클릭 핸들러
  const handleCardClick = useCallback((text, navigationPath, isCenter = false) => {
    // 애니메이션 진행 중이면 클릭 무시
    if (isAnimating) return;
    
    // 클릭된 카드에 해당하는 인덱스 찾기
    const clickedIndex = slides.findIndex(slide => slide.text === text);
    
    if (clickedIndex !== -1) {
      // 마지막 클릭한 카드 인덱스를 localStorage에 저장
      localStorage.setItem('lastClickedCardIndex', clickedIndex.toString());
      
      if (isCenter) {
        // 가운데 카드인 경우 바로 페이지 이동
        navigate(navigationPath);
      } else if (clickedIndex !== activeIndex) {
        // 양옆 카드인 경우 애니메이션 후 페이지 이동
        setIsAnimating(true);
        
        // 해당 카드를 가운데로 이동
        setActiveIndex(clickedIndex);
        
        // 애니메이션 완료 후 페이지 이동 (500ms 대기)
        setTimeout(() => {
          setIsAnimating(false);
          navigate(navigationPath);
        }, 500);
      }
    }
  }, [slides, activeIndex, navigate, isAnimating]);

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
                onCardClick={handleCardClick}
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
              onClick={() => {
                if (!isAnimating) {
                  setActiveIndex(index);
                }
              }}
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
