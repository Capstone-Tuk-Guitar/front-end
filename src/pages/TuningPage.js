import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "../styles/TuningPage.module.css";
import Header from "../components/Header";
import { FaQuestionCircle } from "react-icons/fa";
import { useTour, TourOverlay } from "../components/TourHelper";
import GuitarHead from "../components/GuitarHead";

import guitar1 from "../assets/guitarhead.png";
import guitar2 from "../assets/guitarhead2.png";

const correctNotes = {
  E: "ellipse6", // 낮은 E
  A: "ellipse5",
  D: "ellipse4",
  G: "ellipse3",
  B: "ellipse2",
  E_high: "ellipse1", // 높은 E
};

const tuningRanges = {
  "1": { text: "1번 줄 : 327.63Hz ~ 331.63Hz" },
  "2": { text: "2번 줄 : 244.94Hz ~ 248.94Hz" },
  "3": { text: "3번 줄 : 194.00Hz ~ 198.00Hz" },
  "4": { text: "4번 줄 : 144.83Hz ~ 148.83Hz" },
  "5": { text: "5번 줄 : 108.00Hz ~ 112.00Hz" },
  "6": { text: "6번 줄 : 80.41Hz ~ 84.41Hz" },
  all: { text: "모든 줄을 차례로 튜닝하세요." },
};

const tuningRangeRegex = /(\d+\.?\d*)Hz ~ (\d+\.?\d*)Hz/;

const TuningPage = ({ className }) => {
  const [frequency, setFrequency] = useState(null);
  const [note, setNote] = useState("");
  const [activeString, setActiveString] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [ws, setWs] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [showStringButtons, setShowStringButtons] = useState(false);
  const [selectedString, setSelectedString] = useState(null);
  const [tunedStatus, setTunedStatus] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false
  });
  const isListeningRef = useRef(false);

  const guitarImages = [guitar1, guitar2];

  const tourSteps = [
    {
      target: "startStopGroup",
      title: "측정 시작 / 정지",
      description:
        "튜닝을 시작하거나 정지하려면 이 버튼을 사용하세요.\n측정시작 버튼을 누르면 각 줄의 버튼이 나옵니다.\n차례로 튜닝을 시작해보세요.",
      top: 40,
    },
    {
      target: "centerSquare",
      title: "음/주파수 영역",
      description:
        "현재 감지된 음과 주파수를 이 영역에서 확인할 수 있습니다.\n튜닝이 맞추어지면 초록색으로 변합니다.",
      top: -280,
    },
    {
      target: "tuningInfo",
      title: "튜닝 범위 안내",
      description:
        "선택한 줄의 표준 튜닝 범위가 표시됩니다.\n맞게 튜닝하셔야 연주에 지장이 없습니다.",
      top: -290,
    },
    {
      target: "guitarhead",
      title: "기타 헤드 & 줄",
      description:
        "각 줄에 맞게 조율하세요.\n몸쪽으로 돌리면 음이 올라가고\n기타 헤드쪽으로 돌리면 음이 내려갑니다.\n화살표를 클릭하여 자신 기타에 맞는 헤더로 맞출 수 있습니다.",
      top: -260,
    },
  ];

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
  
  // 웹소켓 연결
  const createWebSocket = () => {
    const socket = new WebSocket("ws://localhost:8000/ws");

    socket.onmessage = (event) => {
      if (!isListeningRef.current) return;

      const data = JSON.parse(event.data);
      const receivedNote = data.note;
      const freq = parseFloat(data.frequency);
      const roundedFreq = freq.toFixed(2);

      setFrequency(roundedFreq);
      setNote(receivedNote);

      let detectedString = null;

      if (receivedNote === "E") {
        detectedString = freq > 300 ? "1" : "6";
      } else if (receivedNote === "E_high") {
        detectedString = "1";
      } else if (correctNotes[receivedNote]) {
        detectedString = correctNotes[receivedNote].replace("ellipse", "");
      }

      if (!detectedString) return;

      // 각 줄 버튼 누르면 해당 줄만 반응
      if (selectedString && selectedString !== "all" && detectedString !== selectedString) {
        return;
      }

      setActiveString(detectedString);

      const match = tuningRanges[detectedString]?.text.match(tuningRangeRegex);
      if (match) {
        const low = parseFloat(match[1]);
        const high = parseFloat(match[2]);
        const freqNum = parseFloat(roundedFreq);

        if (freqNum >= low && freqNum <= high) {
          setTunedStatus((prev) => ({
            ...prev,
            [detectedString]: true,
          }));
        }
      }
    };

    return socket;
  };

  const handleStart = () => {
    if (ws) ws.close();
    const newWs = createWebSocket();
    setWs(newWs);
    isListeningRef.current = true;
    setShowStringButtons(true);
    setNote("");
    setFrequency(null);
    setIsListening(true);
    setActiveString(null);
    setTunedStatus({ 1: false, 2: false, 3: false, 4: false, 5: false, 6: false });
  };

  const handleStop = () => {
    if (ws) {
      ws.close();
      setWs(null);
    }
    isListeningRef.current = false;
    setIsListening(false);
    setNote("");
    setFrequency(null);
    setActiveString(null);
    setShowStringButtons(false);
    setSelectedString(null);
    setTunedStatus({ 1: false, 2: false, 3: false, 4: false, 5: false, 6: false });
  };

  // 전체, 각 줄 버튼 선택 시 동작 함수
  const handleStringButtonClick = (num) => {
    if (num === "all") {
      // 전체 버튼 누르면 튜닝 상태 초기화
      setTunedStatus({ 1: false, 2: false, 3: false, 4: false, 5: false, 6: false });
    }
    setSelectedString(num);
  };

  useEffect(() => {
    if (selectedString && selectedString !== "all") {
      setActiveString(selectedString);
    }
  }, [selectedString]);

  let color = "black";
  if (isListening && selectedString && frequency) {
    if (selectedString === "all") {
      if (activeString) {
        const match = tuningRanges[activeString]?.text.match(tuningRangeRegex);
        if (match) {
          const low = parseFloat(match[1]);
          const high = parseFloat(match[2]);
          const freqNum = parseFloat(frequency);
          color = freqNum >= low && freqNum <= high ? "#2df43b" : "#4287f5";
        }
      }
    } else {
      const match = tuningRanges[selectedString]?.text.match(tuningRangeRegex);
      if (match) {
        const low = parseFloat(match[1]);
        const high = parseFloat(match[2]);
        const freqNum = parseFloat(frequency);
        color = freqNum >= low && freqNum <= high ? "#2df43b" : "#4287f5";
      }
    }
  }

  return (
    <div className="container">
      <Header />

      <div className={styles.helpButtonContainer}>
        <button className={styles.helpButton} onClick={startTour}>
          <FaQuestionCircle style={{ marginRight: "8px" }} />
          도움말
        </button>
      </div>

      <div className={`${styles.divWrapper} ${className || ""}`}>
        {/* 버튼 그룹 */}
        <div
          id="startStopGroup"
          className={`${styles.controlButtons} ${showStringButtons ? styles.shifted : ""} ${getHighlightClass("startStopGroup")}`}
        >
          <button onClick={handleStart} disabled={isListening}>측정 시작</button>
          <button onClick={handleStop} disabled={!isListening}>정지</button>
        </div>

        {showStringButtons && (
          <div className={styles.stringButtons}>
            {["1", "2", "3", "4", "5", "6", "all"].map((num) => (
              <button
                key={num}
                className={`${styles.stringBtn} ${selectedString === num ? styles.active : ""}`}
                onClick={() => handleStringButtonClick(num)}
              >
                {num === "all" ? "전체" : `${num}번 줄`}
              </button>
            ))}
          </div>
        )}

        <div id="centerSquare" className={`${styles.centerSquare} ${getHighlightClass("centerSquare")}`}>
          <span className={styles.squareText} style={{ color }}>{note || "—"}</span>
          <span className={styles.squarefre}>{frequency ? `${frequency} Hz` : "—"}</span>
        </div>

        <GuitarHead
          fenderImage={guitarImages[imageIndex]}
          guitar2={guitar2}
          activeString={activeString}
          getHighlightClass={getHighlightClass}
          onPrevImage={() => setImageIndex((prev) => (prev - 1 + guitarImages.length) % guitarImages.length)}
          onNextImage={() => setImageIndex((prev) => (prev + 1) % guitarImages.length)}
          selectedString={selectedString}
          tunedStrings={Object.keys(tunedStatus).filter((key) => tunedStatus[key])}
        />

        <div id="tuningInfo" className={`${styles.tuningInfoContainer} ${getHighlightClass("tuningInfo")}`}>
          {showStringButtons && selectedString && (
            <div className={styles.tuningInfoText}>
              (A4=440 기준) {tuningRanges[selectedString].text}
            </div>
          )}
        </div>
      </div>

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

TuningPage.propTypes = {
  className: PropTypes.string,
};

export default TuningPage;
