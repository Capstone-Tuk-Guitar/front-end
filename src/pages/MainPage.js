import React from "react";
import Header from "../components/Header";
import Card from "../components/Card";
import styles from "../styles/MainPage.module.css";

import guitarImage from "../assets/guitar.png"; // 이미지 가져오기

const MainPage = () => {
  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.slider}>
        <div className={styles.slide}>
          <button className={styles.arrowButton}>❮</button>
          <Card image={guitarImage} text="연주하기" />
          <button className={styles.arrowButton}>❯</button>
        </div>
        <div className={styles.pagination}>
          <span className={styles.dot}></span>
          <span className={`${styles.dot} ${styles.active}`}></span>
          <span className={styles.dot}></span>
        </div>
      </div>

      <div className={styles.footer}>
        기타 코드 사진 랜덤으로 보여주기
      </div>
    </div>
  );
};

export default MainPage;
