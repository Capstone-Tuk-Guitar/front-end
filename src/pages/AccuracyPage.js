import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaQuestionCircle } from "react-icons/fa";
import Header from "../components/Header";
import PieChart from "../components/PieChart";

import { useTour, TourOverlay } from "../components/TourHelper";
import styles from "../styles/AccuracyPage.module.css";

function AccuracyPage() {
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [midiFile1, setMidiFile1] = useState(null);
    const [midiFile2, setMidiFile2] = useState(null);
    const [converting1, setConverting1] = useState(false);
    const [converting2, setConverting2] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // 투어 단계별 정보
    const tourSteps = [
        {
            target: 'fileUploadCard',
            title: '파일 업로드',
            description: 'MP3 또는 MIDI 파일을 업로드하여\n두 음악 파일을 비교할 수 있습니다.',
                        top: -160
        },
        {
            target: 'compareButton',
            title: '비교 실행',
            description: '업로드된 두 파일을 비교하여\n유사도를 분석합니다.',
            top: -275
        },
        {
            target: 'finalResultCard',
            title: '최종 유사도',
            description: '두 음악의 전체적인 유사도를\n확인할 수 있습니다.',
            top: -180
        },
        {
            target: 'detailResultsCard',
            title: '세부 유사도',
            description: '음 높이, 리듬, 멜로디 간격별로\n세부적인 유사도를 확인할 수 있습니다.',
            top: -275
        },
        {
            target: 'detailViewCard',
            title: '상세보기',
            description: '더 자세한 분석 결과를 확인하려면\n상세보기를 클릭하세요.',
            top: -275
        }
    ];

    // 도움말 투어 훅 사용
    const {
        isTourActive,
        tourStep,
        tooltipPosition,
        startTour,
        nextTourStep,
        prevTourStep,
        endTour,
        getHighlightClass
    } = useTour(tourSteps);
    
    const [result, setResult] = useState({
        pitch_similarity: 0,
        rhythm_similarity: 0,
        interval_similarity: 0,
        final_similarity: 0,
    });

    const handleFileChange = (event, setFile) => {
        setFile(event.target.files[0]);
    };

    // MP3를 MIDI로 변환하는 함수
    const convertToMidi = async (mp3File, setMidiFile, setConverting) => {
        if (!mp3File) {
            alert("MP3 파일을 먼저 선택하세요.");
            return;
        }

        setConverting(true);

        try {
            // 변환 요청 보내기
            const formData = new FormData();
            formData.append("file", mp3File);
            formData.append("model", "guitar");
            formData.append("title", mp3File.name.replace('.mp3', ''));
            formData.append("composer", "Unknown");
            formData.append("outputs", "midi");

            const res = await fetch("http://localhost:8000/convert/transcription/", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Transcription failed");
            const { job_id } = await res.json();
            console.log("job_id:", job_id);

            // 1분 대기 후 MIDI 파일 다운로드
            setTimeout(async () => {
                try {
                    const downloadRes = await fetch(`http://localhost:8000/convert/download/${job_id}/midi`);
                    if (downloadRes.status === 200) {
                        const midiBlob = await downloadRes.blob();
                        const midiFile = new File([midiBlob], `${mp3File.name.replace('.mp3', '')}.mid`, { type: "audio/midi" });
                        setMidiFile(midiFile);
                    } else {
                        alert("MIDI 변환에 실패했습니다.");
                    }
                } catch (err) {
                    console.error("MIDI 다운로드 실패:", err);
                    alert("MIDI 파일 다운로드에 실패했습니다.");
                }
                setConverting(false);
            }, 60000); // 1분 대기

        } catch (err) {
            console.error("변환 요청 실패:", err);
            alert("변환 요청에 실패했습니다.");
            setConverting(false);
        }
    };

    const handleCompare = async () => {
        // MIDI 파일이 있는 경우 MIDI 파일로 비교, 없으면 원본 파일로 비교
        const compareFile1 = midiFile1 || file1;
        const compareFile2 = midiFile2 || file2;

        if (!compareFile1 || !compareFile2) {
            alert("두 개의 파일을 업로드하세요.");
            return;
        }

        const formData = new FormData();
        formData.append("file1", compareFile1);
        formData.append("file2", compareFile2);
        formData.append("user_id", localStorage.getItem("user_id"));

        setLoading(true);

        try {
            const response = await axios.post("http://localhost:8000/compare/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setResult(response.data);
        } catch (error) {
            console.error("비교 실패:", error);
            alert("비교 중 오류가 발생했습니다.");
        }
        setLoading(false);
    };

    const handleDetailView = () => {
        const compareFile1 = midiFile1 || file1;
        const compareFile2 = midiFile2 || file2;

        if (!compareFile1 || !compareFile2) {
            alert("두 개의 파일을 업로드하세요.");
            return;
        }

        // final_similarity가 0인 상태는 비교가 수행되지 않은 상태로 간주
        if (result.final_similarity === 0) {
            alert("두 파일의 비교를 먼저 수행해주세요.");
            return;
        }

        // 파일을 DetailDiffPage로 전달
        navigate("/detail_diff", { state: { file1: compareFile1, file2: compareFile2 } });
    };

    return (
        <div className="container">
            <Header />
            
            {/* 도움말 버튼 */}
            <div className={styles.helpButtonContainer}>
                <button className={styles.helpButton} onClick={startTour}>
                    <FaQuestionCircle style={{ marginRight: "8px" }} />
                    도움말
                </button>
            </div>
            
            <div className={styles.container}>
                <div className={styles.mainContent}>
                    <div className={styles.leftSection}>
                        <div 
                            id="fileUploadCard" 
                            className={`${styles.fileUploadCard} ${getHighlightClass('fileUploadCard')}`}
                        >
                            <h1>MIDI 파일 비교</h1>
                            <div className={styles.inputs}>
                                <div className={styles.inputGroup}>
                                    <input 
                                        type="file" 
                                        accept=".mp3,.mid,.midi" 
                                        onChange={(e) => handleFileChange(e, setFile1)}
                                        placeholder="첫 번째 파일을 선택하세요"
                                    />
                                    <button
                                        onClick={() => convertToMidi(file1, setMidiFile1, setConverting1)}
                                        disabled={converting1 || !file1}
                                        className={styles.convertButton}
                                    >
                                        {converting1 ? "변환 중..." : "MIDI 변환"}
                                    </button>
                                    {midiFile1 && <span className={styles.convertedText}>✓ 변환 완료</span>}
                                </div>
                                <div className={styles.inputGroup}>
                                    <input 
                                        type="file" 
                                        accept=".mp3,.mid,.midi" 
                                        onChange={(e) => handleFileChange(e, setFile2)}
                                        placeholder="두 번째 파일을 선택하세요"
                                    />
                                    <button
                                        onClick={() => convertToMidi(file2, setMidiFile2, setConverting2)}
                                        disabled={converting2 || !file2}
                                        className={styles.convertButton}
                                    >
                                        {converting2 ? "변환 중..." : "MIDI 변환"}
                                    </button>
                                    {midiFile2 && <span className={styles.convertedText}>✓ 변환 완료</span>}
                                </div>
                            </div>
                            <button
                                id="compareButton"
                                onClick={handleCompare}
                                disabled={loading}
                                className={`${styles.compareButton} ${getHighlightClass('compareButton')}`}
                            >
                                {loading ? "비교 중..." : "비교하기"}
                            </button>
                        </div>
                        
                        <div 
                            id="detailViewCard" 
                            className={`${styles.detailViewCard} ${getHighlightClass('detailViewCard')}`} 
                            onClick={handleDetailView}
                        >
                            <h3>상세 비교 결과 보기</h3>
                            <p>클릭하여 상세한 비교 분석을 확인하세요</p>
                        </div>
                    </div>

                    <div className={styles.rightSection}>
                        <div 
                            id="finalResultCard" 
                            className={`${styles.finalResultCard} ${getHighlightClass('finalResultCard')}`}
                        >
                            <h2>최종 유사도</h2>
                            <PieChart value={result.final_similarity} color="#4BC0C0" size="large" />
                        </div>
                        
                        <div 
                            id="detailResultsCard" 
                            className={`${styles.detailResultsCard} ${getHighlightClass('detailResultsCard')}`}
                        >
                            <h2>세부 유사도</h2>
                            <div className={styles.detail_charts}>
                                <PieChart title="음 높이" value={result.pitch_similarity} color="#FF6384" />
                                <PieChart title="리듬" value={result.rhythm_similarity} color="#36A2EB" />
                                <PieChart title="멜로디 간격" value={result.interval_similarity} color="#FFCE56" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* 투어 오버레이 */}
            <TourOverlay
                isTourActive={isTourActive}
                tourStep={tourStep}
                tooltipPosition={tooltipPosition}
                tourSteps={tourSteps}
                endTour={endTour}
                prevTourStep={prevTourStep}
                nextTourStep={nextTourStep}
            />
        </div>
    );
}

export default AccuracyPage;