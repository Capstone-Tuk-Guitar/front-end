import React, { useEffect, useState } from "react";
import DetailChord from "../components/DetailChord";
import styles from "../styles/ChordGuide.module.css";

// 코드 이미지 import
const chordImages = {
  "C major": require("../assets/ChordPhoto/C.png"),
  "G major": require("../assets/ChordPhoto/G.png"),
  "D major": require("../assets/ChordPhoto/D.png"),
  "A major": require("../assets/ChordPhoto/A.png"),
  "E major": require("../assets/ChordPhoto/E.png"),
  "F major": require("../assets/ChordPhoto/F.png"),
  "B major": require("../assets/ChordPhoto/B.png"),
  "C# major": require("../assets/ChordPhoto/C_.png"),
  "D# major": require("../assets/ChordPhoto/D_.png"),
  "F# major": require("../assets/ChordPhoto/F_.png"),
  "G# major": require("../assets/ChordPhoto/G_.png"),
  "A# major": require("../assets/ChordPhoto/A_.png"),
  "C minor": require("../assets/ChordPhoto/Cminor.png"),
  "G minor": require("../assets/ChordPhoto/Gminor.png"),
  "D minor": require("../assets/ChordPhoto/Dminor.png"),
  "A minor": require("../assets/ChordPhoto/Aminor.png"),
  "E minor": require("../assets/ChordPhoto/Eminor.png"),
  "F minor": require("../assets/ChordPhoto/Fminor.png"),
  "B minor": require("../assets/ChordPhoto/Bminor.png"),
  "C 7": require("../assets/ChordPhoto/C7.png"),
  "G 7": require("../assets/ChordPhoto/G7.png"),
  "D 7": require("../assets/ChordPhoto/D7.png"),
  "A 7": require("../assets/ChordPhoto/A7.png"),
  "E 7": require("../assets/ChordPhoto/E7.png"),
  "F 7": require("../assets/ChordPhoto/F7.png"),
  "B 7": require("../assets/ChordPhoto/B7.png"),
  "C# 7": require("../assets/ChordPhoto/C_7.png"),
  "D# 7": require("../assets/ChordPhoto/D_7.png"),
  "F# 7": require("../assets/ChordPhoto/F_7.png"),
  "G# 7": require("../assets/ChordPhoto/G_7.png"),
  "A# 7": require("../assets/ChordPhoto/A_7.png"),
};

const ChordGuide = ({ chordTimeline }) => {
  const [uniqueChords, setUniqueChords] = useState([]);
  const [selectedChord, setSelectedChord] = useState(null); // 선택한 코드 이미지 저장

  useEffect(() => {
    // 중복 제거된 코드 목록 생성
    const chords = [...new Set(chordTimeline.map(item => item.chord))];
    setUniqueChords(chords);
  }, [chordTimeline]);

  return (
    <div className={styles.container}>
      <div className={styles.chordGrid}>
        {uniqueChords.map((chord) => (
          <div key={chord} className={styles.chordItem}>
            {chordImages[chord] && (
              <img 
                src={chordImages[chord]} 
                alt={`${chord} 운지법`} 
                className={styles.chordImage}
                onClick={() => setSelectedChord(chordImages[chord])}
              />
            )}
          </div>
        ))}
      </div>

      {selectedChord && <DetailChord chordImage={selectedChord} onClose={() => setSelectedChord(null)} />}
    </div>
  );
};

export default ChordGuide; 