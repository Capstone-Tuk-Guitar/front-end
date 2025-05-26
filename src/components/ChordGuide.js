import React, { useEffect, useState } from "react";
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
  "C minor": require("../assets/ChordPhoto/Cminor.png"),
  "G minor": require("../assets/ChordPhoto/Gminor.png"),
  "D minor": require("../assets/ChordPhoto/Dminor.png"),
  "A minor": require("../assets/ChordPhoto/Aminor.png"),
  "E minor": require("../assets/ChordPhoto/Eminor.png"),
  "F minor": require("../assets/ChordPhoto/Fminor.png"),
  "B minor": require("../assets/ChordPhoto/Bminor.png"),
};

const ChordGuide = ({ chordTimeline }) => {
  const [uniqueChords, setUniqueChords] = useState([]);

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
            <h3>{chord}</h3>
            {chordImages[chord] && (
              <img 
                src={chordImages[chord]} 
                alt={`${chord} 운지법`} 
                className={styles.chordImage}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChordGuide; 