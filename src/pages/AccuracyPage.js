import React, { useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import PieChart from "../components/PieChart";
import styles from "../styles/AccuracyPage.module.css";

function AccuracyPage() {
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    // const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const [result, setResult] = useState({
        pitch_similarity: 0,
        rhythm_similarity: 0,
        interval_similarity: 0,
        final_similarity: 0,
    });

    const handleFileChange = (event, setFile) => {
        setFile(event.target.files[0]);
    };

    const handleCompare = async () => {
        if (!file1 || !file2) {
            alert("두 개의 파일을 업로드하세요.");
            return;
        }

        const formData = new FormData();
        formData.append("file1", file1);
        formData.append("file2", file2);
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

    return (
        <div className="container">
            <Header />
            
            <div className={styles.container}>
                <h1>MIDI 파일 비교</h1>

                <div className={styles.inputs}>
                    <input type="file" accept=".mid" onChange={(e) => handleFileChange(e, setFile1)} />
                    <input type="file" accept=".mid" onChange={(e) => handleFileChange(e, setFile2)} />
                </div>

                <button
                    onClick={handleCompare}
                    disabled={loading}
                >
                    {loading ? "비교 중..." : "비교하기"}
                </button>

                <div className={styles.results}>
                    <h2 className={styles.results_text}>비교 결과:</h2>
                    <div className={styles.chart_container}>
                        <PieChart title="음 높이 유사도" value={result.pitch_similarity} color="#FF6384" />
                        <PieChart title="리듬 유사도" value={result.rhythm_similarity} color="#36A2EB" />
                        <PieChart title="멜로디 간격 유사도" value={result.interval_similarity} color="#FFCE56" />
                        <PieChart title="최종 유사도" value={result.final_similarity} color="#4BC0C0" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccuracyPage;
