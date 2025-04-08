import React, { useState, useEffect } from "react";
import styles from "../styles/ChordDiagram.module.css";

const ChordDiagram = ({ chord }) => {
    const [imageSrc, setImageSrc] = useState(null);
  
    useEffect(() => {
      let root, type;
  
      if (chord[1] === "#") {
        root = chord.slice(0, 2).replace("#", "_");
        type = chord.slice(2) || "major";
      } else {
        root = chord.slice(0, 1);
        type = chord.slice(1) || "major";
      }
  
      const filename = `${root}${type === "major" ? "" : type}.png`;
      import(`../assets/ChordPhoto/${filename}`)
        .then((module) => {
          setImageSrc(module.default);
        })
        .catch((err) => {
          console.error("이미지 로드 실패:", err);
          setImageSrc(null);
        });
    }, [chord]);
  
    return (
      <div className={styles.diagramContainer}>
  
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={`${chord} chord diagram`}
            className={styles.chordImage}
          />
        ) : (
          <p className={styles.errorText}>❌ 해당 코드 이미지가 없습니다.</p>
        )}
      </div>
    );
  };
  
  export default ChordDiagram;