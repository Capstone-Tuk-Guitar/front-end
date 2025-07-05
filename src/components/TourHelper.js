import React, { useState, useEffect, useCallback } from "react";
import styles from "../styles/TourHelper.module.css";

// 투어 훅 - tourSteps와 옵션을 매개변수로 받음
export const useTour = (tourSteps, options = {}) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // 기본 위치 계산 함수
  const defaultPositionCalculator = (rect, scrollTop, customOffset) => {
    const viewportWidth = window.innerWidth;
    
    let top, left;
    
    // 커스텀 offset이 있으면 사용, 없으면 기본 로직 사용
    if (customOffset !== undefined) {
      top = rect.top + scrollTop + customOffset;
    } else {
      // 요소 위쪽에 충분한 공간이 있는지 확인
      const spaceAbove = rect.top;
      const tooltipHeight = 200; // 예상 말풍선 높이
      
      if (spaceAbove > tooltipHeight + 50) {
        // 위쪽에 공간이 있으면 요소 위에 배치
        top = rect.top + scrollTop - 180;
      } else {
        // 아니면 아래쪽에 배치
        top = rect.bottom + scrollTop + 20;
      }
    }
    
    // 좌우 위치 계산 (화면 밖으로 나가지 않도록)
    left = rect.left + rect.width / 2;
    const tooltipWidth = 420; // 예상 말풍선 너비
    
    if (left + tooltipWidth / 2 > viewportWidth) {
      left = viewportWidth - tooltipWidth / 2 - 20;
    } else if (left - tooltipWidth / 2 < 0) {
      left = tooltipWidth / 2 + 20;
    }
    
    return { top, left };
  };

  // 위치 계산 함수 (커스텀 또는 기본)
  const positionCalculator = options.positionCalculator || defaultPositionCalculator;

  // 말풍선 위치 계산
  const calculateTooltipPosition = useCallback((targetId) => {
    const element = document.getElementById(targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // 현재 단계의 top 속성 가져오기
      const currentStep = tourSteps && tourSteps[tourStep];
      const customOffset = currentStep ? currentStep.top : undefined;
      
      const position = positionCalculator(rect, scrollTop, customOffset);
      setTooltipPosition(position);
    }
  }, [positionCalculator, tourSteps, tourStep]);

  // 투어 단계가 변경될 때마다 말풍선 위치 업데이트
  useEffect(() => {
    if (isTourActive && tourSteps && tourSteps[tourStep]) {
      setTimeout(() => {
        calculateTooltipPosition(tourSteps[tourStep].target);
      }, 100);                                // DOM 업데이트 후 위치 계산
    }
  }, [isTourActive, tourStep, tourSteps, calculateTooltipPosition]);

  // 도움말 투어 시작
  const startTour = () => {
    setIsTourActive(true);
    setTourStep(0);
  };

  // 다음 단계로 이동
  const nextTourStep = () => {
    if (!tourSteps) return;
    if (tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      endTour();
    }
  };

  // 이전 단계로 이동
  const prevTourStep = () => {
    if (tourStep > 0) {
      setTourStep(tourStep - 1);
    }
  };

  // 투어 종료
  const endTour = () => {
    setIsTourActive(false);
    setTourStep(0);
  };

  // 하이라이트 클래스 반환
  const getHighlightClass = (target) => {
    return isTourActive && tourSteps && tourSteps[tourStep]?.target === target ? styles.highlighted : '';
  };

  return {
    isTourActive,
    tourStep,
    tooltipPosition,
    startTour,
    nextTourStep,
    prevTourStep,
    endTour,
    getHighlightClass
  };
};

// 투어 오버레이 컴포넌트
export const TourOverlay = ({ 
  isTourActive, 
  tourStep, 
  tooltipPosition, 
  tourSteps, 
  endTour, 
  prevTourStep, 
  nextTourStep 
}) => {
  if (!isTourActive) return null;

  return (
    <>
      <div className={styles.tourOverlay} onClick={endTour}></div>
      <div 
        className={styles.tourTooltip}
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          transform: 'translateX(-50%)'
        }}
      >
        <div className={styles.tooltipArrow}></div>
        <h3>{tourSteps[tourStep]?.title}</h3>
        <p>{tourSteps[tourStep]?.description}</p>
        <div className={styles.tourButtons}>
          <button onClick={endTour} className={styles.skipButton}>건너뛰기</button>
          <div className={styles.stepIndicator}>
            {tourStep + 1}/{tourSteps.length}
          </div>
          {tourStep > 0 && (
            <button onClick={prevTourStep} className={styles.prevButton}>이전</button>
          )}
          <button onClick={nextTourStep} className={styles.nextButton}>
            {tourStep < tourSteps.length - 1 ? '다음' : '완료'}
          </button>
        </div>
      </div>
    </>
  );
}; 