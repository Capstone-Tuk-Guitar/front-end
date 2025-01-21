import React, { useState } from "react";
import Header from "../components/Header";
import Card from "../components/Card";
import styles from "../styles/MainPage.module.css";

import musicImage from "../assets/music.svg";
import guitarImage from "../assets/guitar.svg";
import recordImage from "../assets/stats.svg";
import fingeringImage from "../assets/music.svg";

const MainPage = () => {
  const [activeIndex, setActiveIndex] = useState(1); // 중앙 슬라이드 인덱스

  const slides = [
    { id: 0, image: musicImage, text: "음악 목록" },
    { id: 1, image: guitarImage, text: "연주하기" },
    { id: 2, image: recordImage, text: "연주 기록" },
  ];

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  return (
    <div className={styles.container}>
      <Header />

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

      <div className={styles.fingering}>
        <img src={fingeringImage} alt="Fingering" />
        <img src={fingeringImage} alt="Fingering" />
        <img src={fingeringImage} alt="Fingering" />
        {/* 기타 코드(운지법) 랜덤으로 보여주기 */}
      </div>
    </div>
  );
};

export default MainPage;
