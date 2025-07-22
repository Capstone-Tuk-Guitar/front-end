import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaQuestionCircle } from "react-icons/fa";

import Header from "../components/Header";
import Card from "../components/Card";
import DetailChord from "../components/DetailChord";
import { useTour, TourOverlay } from "../components/TourHelper";

import styles from "../styles/MainPage.module.css";
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

  const [activeIndex, setActiveIndex] = useState(() => {
    const savedIndex = localStorage.getItem("lastClickedCardIndex");
    return savedIndex ? parseInt(savedIndex, 10) : 1;
  });

  const [selectedChord, setSelectedChord] = useState(null);
  const [randomChords, setRandomChords] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const slides = useMemo(
    () => [
      { id: 0, image: musicImage, text: "음원 목록" },
      { id: 1, image: guitarImage, text: "연주하기" },
      { id: 2, image: compareImage, text: "비교하기" },
      { id: 3, image: recordImage, text: "연주 기록" },
    ],
    []
  );

  useEffect(() => {
    if (allChordImages.length > 0) {
      const shuffledImages = [...allChordImages].sort(() => 0.5 - Math.random());
      setRandomChords(shuffledImages.slice(0, 3));
    }
  }, []);

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [isAnimating, slides.length]);

  const handlePrev = useCallback(() => {
    if (isAnimating) return;
    setActiveIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  }, [isAnimating, slides.length]);

  const handleChordClick = useCallback((img) => {
    setSelectedChord(img);
  }, []);

  const handleCloseChord = useCallback(() => {
    setSelectedChord(null);
  }, []);

  const handleCardClick = useCallback(
    (text, navigationPath, isCenter = false) => {
      if (isAnimating) return;

      const clickedIndex = slides.findIndex((slide) => slide.text === text);

      if (clickedIndex !== -1) {
        localStorage.setItem("lastClickedCardIndex", clickedIndex.toString());

        if (isCenter) {
          navigate(navigationPath);
        } else if (clickedIndex !== activeIndex) {
          setIsAnimating(true);
          setActiveIndex(clickedIndex);

          setTimeout(() => {
            setIsAnimating(false);
            navigate(navigationPath);
          }, 500);
        }
      }
    },
    [slides, activeIndex, navigate, isAnimating]
  );

  // ✅ 도움말 단계 정의
  const tourSteps = [
    {
      target: "headerSection",
      title: "상단 메뉴바",
      description: "여기서 페이지 이동, 전체 메뉴 보기, 로그아웃 등을 할 수 있어요!",
      top: 60,
    },
    {
      target: "sliderSection",
      title: "메인 카드 선택",
      description: "연주하기, 음원 목록, 기록 보기 등 다양한 기능을 이곳에서 선택할 수 있어요!",
      top: -280,
    },
    {
      target: "fingeringSection",
      title: "코드 운지 연습",
      description: "여기서는 무작위로 추천된 코드 운지 이미지를 클릭해 자세히 볼 수 있어요!",
      top: -280,
    },
  ];

  // ✅ useTour 사용
  const {
    isTourActive,
    tourStep,
    tooltipPosition,
    startTour,
    nextTourStep,
    prevTourStep,
    endTour,
    getHighlightClass,
    moveToStep,
  } = useTour(tourSteps);

  return (
    <div className="container">
      {/* Header에 id/className 추가 */}
      <Header
        id="headerSection"
        className={`${getHighlightClass("headerSection")} ${!isTourActive ? styles.headerReset : ""}`}
      />

      {/* 도움말 버튼 */}
      <div className={styles.helpButtonContainer}>
        <button className={styles.helpButton} onClick={startTour}>
          <FaQuestionCircle style={{ marginRight: "8px" }} />
          도움말
        </button>
      </div>

      <div className={`${styles.container} ${getHighlightClass("sliderSection")}`} id="sliderSection">
        <div className={styles.slider}>
          <button className={styles.arrowButton} onClick={handlePrev}>❮</button>
          <div className={styles.slide}>
            {slides.map((slide, index) => (
              <Card
                key={slide.id}
                image={slide.image}
                text={slide.text}
                isActive={index === activeIndex}
                position={index - activeIndex}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
          <button className={styles.arrowButton} onClick={handleNext}>❯</button>
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

      {/* 운지 이미지 */}
      <div
        className={`${styles.fingering} ${getHighlightClass("fingeringSection")}`}
        id="fingeringSection"
      >
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

      {/* 선택된 코드 운지 상세 */}
      {selectedChord && (
        <DetailChord chordImage={selectedChord} onClose={handleCloseChord} />
      )}

      {/* TourOverlay 추가 */}
      <TourOverlay
        isTourActive={isTourActive}
        tourStep={tourStep}
        tooltipPosition={tooltipPosition}
        tourSteps={tourSteps}
        endTour={endTour}
        prevTourStep={prevTourStep}
        nextTourStep={nextTourStep}
        moveToStep={moveToStep}
      />
    </div>
  );
};

export default MainPage;