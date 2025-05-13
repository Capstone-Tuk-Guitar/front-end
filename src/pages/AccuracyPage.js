import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import PieChart from "../components/PieChart";
import styles from "../styles/AccuracyPage.module.css";

function AccuracyPage() {
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
    formData.append("user_id", localStorage.getItem("user_id"));  // ✅ user_id 추가!

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
        if (!file1 || !file2) {
            alert("두 개의 파일을 업로드하세요.");
            return;
        }

        // final_similarity가 0인 상태는 비교가 수행되지 않은 상태로 간주
        if (result.final_similarity === 0) {
            alert("두 파일의 비교를 먼저 수행해주세요.");
            return;
        }

        // 파일을 DetailDiffPage로 전달
        navigate("/detail_diff", { state: { file1, file2 } });
    };

    return (
        <div className="container">
            <Header />
            
            <div className={styles.container}>
                <div className={styles.topSection}>
                    <div className={styles.fileInsert}>
                        <h1>MIDI 파일 비교</h1>
                        <div className={styles.inputs}>
                            <input type="file" accept=".mid, .midi" onChange={(e) => handleFileChange(e, setFile1)} />
                            <input type="file" accept=".mid, .midi" onChange={(e) => handleFileChange(e, setFile2)} />
                        </div>
                        <button
                            onClick={handleCompare}
                            disabled={loading}
                        >
                            {loading ? "비교 중..." : "비교하기"}
                        </button>
                    </div>
                    <div className={styles.showSheet}>
                        <div onClick={handleDetailView}>
                            상세보기
                        </div>
                    </div>
                    <div className={styles.final_chart}>
                        <h2 className={styles.results_text}>최종 유사도</h2> 
                        <PieChart value={result.final_similarity} color="#4BC0C0" />
                    </div>
                </div>

                <div className={styles.bottomSection}>
                    <h2 className={styles.results_text}>세부 유사도</h2> 
                    <div className={styles.detail_charts}>
                        <PieChart title="음 높이 유사도" value={result.pitch_similarity} color="#FF6384" />
                        <PieChart title="리듬 유사도" value={result.rhythm_similarity} color="#36A2EB" />
                        <PieChart title="멜로디 간격 유사도" value={result.interval_similarity} color="#FFCE56" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccuracyPage;