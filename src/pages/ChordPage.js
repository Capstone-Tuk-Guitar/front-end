import React, { useState } from 'react';
import ChordDiagram from '../components/ChordDiagram';
import ChordSelector from '../components/ChordSelector';
import RhythmGame from '../components/RhythmGame';
import Header from "../components/Header";

import { FaQuestionCircle } from "react-icons/fa";
import { useTour, TourOverlay } from "../components/TourHelper";
import styles from '../styles/ChordPage.module.css';

const ChordPage = () => {
  const [selectedRoot, setSelectedRoot] = useState('C');
  const [selectedType, setSelectedType] = useState('major');

  const currentdiagramChord = `${selectedRoot}${selectedType === 'major' ? '' : selectedType}`;
  const currentChord = `${selectedRoot} ${selectedType}`;

  
  const tourSteps = [
    {
      target: "chordDiagramStep",
      title: "코드 다이어그램",
      description: "현재 선택된 코드의 운지법을 확인할 수 있어요.",
      top: -200,
    },
    {
      target: "chordSelectorStep",
      title: "코드 선택",
      description: "여기서 코드 음와 음정을 선택할 수 있어요.",
      top: -250,
    },
    {
      target: "rhythmGameStep",
      title: "리듬 게임",
      description: "이곳에서 리듬에 맞춰 연주 연습을 할 수 있어요.",
      top: -250,
    },
  ];

  // ✅ useTour 훅 사용
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
      {/* ✅ Header에 id/class 추가 */}
      <Header
        id="headerSection"
        className={getHighlightClass("headerSection")}
      />

      {/* ✅ 도움말 버튼 */}
      <div className={styles.helpButtonContainer}>
        <button className={styles.helpButton} onClick={startTour}>
          <FaQuestionCircle style={{ marginRight: "8px" }} />
          도움말
        </button>
      </div>

      <div className={styles.content}>
        {/* ✅ 코드 다이어그램 */}
        <div
          className={`${styles.chordSection} ${getHighlightClass("chordDiagramStep")}`}
          id="chordDiagramStep"
        >
          <ChordDiagram chord={currentdiagramChord} />
        </div>

        {/* ✅ 코드 선택 */}
        <div
          className={`${styles.selectorWrapper} ${getHighlightClass("chordSelectorStep")}`}
          id="chordSelectorStep"
        >
          <ChordSelector
            selectedRoot={selectedRoot}
            setSelectedRoot={setSelectedRoot}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
          />
        </div>

        {/* ✅ 리듬 게임 */}
        <div
          className={`${styles.statusLayout} ${getHighlightClass("rhythmGameStep")}`}
          id="rhythmGameStep"
        >
          <div className={styles.rhythmGameWrapper}>
            <RhythmGame expectedChord={currentChord} />
          </div>
        </div>
      </div>

      {/* ✅ TourOverlay 삽입 */}
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

export default ChordPage;
