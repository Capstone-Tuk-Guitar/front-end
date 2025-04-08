import React, { useState, useEffect } from 'react'; 
import ChordDiagram from '../components/ChordDiagram';
import ChordSelector from '../components/ChordSelector';
import RhythmGame from '../components/RhythmGame';
import Header from "../components/Header";
import styles from '../styles/ChordPage.module.css';

export const ChordPage = () => {
    const [selectedRoot, setSelectedRoot] = useState('C');
    const [selectedType, setSelectedType] = useState('major');
    //const [expectedNotes, setExpectedNotes] = useState([]);
    const [detectedNote, setDetectedNote] = useState(null);

    const currentChord = `${selectedRoot}${selectedType === 'major' ? '' : selectedType}`;
    
    //useEffect(() => {
    //    fetch("http://localhost:8000/chords")
    //        .then(response => response.json())
    //        .then(data => {
    //            setExpectedNotes(data[currentChord] || []);
    //        })
    //        .catch(error => console.error("Error loading chord data:", error));
    //}, [currentChord]);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws/chordprac");

        ws.onmessage = (event) => {
            setDetectedNote(event.data);
        };

        return () => {
            ws.close();
        };
    }, []);

    return (
        <div className={styles.container}>
            <Header />

            <div className={styles.content}>
                <div className={styles.chordSection}>
                    <ChordDiagram chord={currentChord} />
                </div>

                <div className={styles.selectorWrapper}>
                    <ChordSelector 
                        selectedRoot={selectedRoot} 
                        setSelectedRoot={setSelectedRoot}
                        selectedType={selectedType}
                        setSelectedType={setSelectedType}
                    />
                </div>

        <div className={styles.statusLayout}>
            <div className={styles.rhythmGameWrapper}>
                <RhythmGame expectedChord={currentChord} detectedNote={detectedNote} />
            </div>
        </div>
            </div>
        </div>
    );
};

export default ChordPage;
