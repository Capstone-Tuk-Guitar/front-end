import React from 'react';
import styles from '../styles/ChordSelector.module.css';

const rootNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const chordTypes = ['major', 'minor', '7', '5', 'dim', 'dim7', 'aug', 'sus2', 'sus4', 'maj7', 'm7', '7sus4'];

const ChordSelector = ({ selectedRoot, setSelectedRoot, selectedType, setSelectedType }) => {
  return (
    <div className={styles.selectorContainer}>
      <div className={styles.buttonGroup}>
        {rootNotes.map(note => (
          <button
            key={note}
            className={`${styles.rootButton} ${selectedRoot === note ? styles.active : ''}`}
            onClick={() => setSelectedRoot(note)}
          >
            {note}
          </button>
        ))}
      </div>

      <div className={styles.buttonGroup}>
        {chordTypes.map(type => (
          <button
            key={type}
            className={`${styles.typeButton} ${selectedType === type ? styles.active : ''}`}
            onClick={() => setSelectedType(type)}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChordSelector;
