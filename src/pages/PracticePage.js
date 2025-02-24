import React, { useState } from "react";
import axios from "axios";
import Header from "../components/Header";

function PracticePage() {
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [result, setResult] = useState(null);

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

        try {
            const response = await axios.post("http://localhost:8000/compare/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setResult(response.data);
        } catch (error) {
            console.error("비교 실패:", error);
            alert("비교 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="container">
            <Header />
            <h1>MIDI 파일 비교</h1>
            <hr />

            <input type="file" accept=".midi" onChange={(e) => handleFileChange(e, setFile1)} />
            <input type="file" accept=".midi" onChange={(e) => handleFileChange(e, setFile2)} />
            <br />

            <button onClick={handleCompare}>비교하기</button>
            {result && (
                <div>
                    <h3>비교 결과:</h3>
                    <p><strong>음 높이 유사도:</strong> {result.pitch_similarity * 100}%</p>
                    <p><strong>리듬 유사도:</strong> {result.rhythm_similarity * 100}%</p>
                    <p><strong>멜로디 간격 유사도:</strong> {result.interval_similarity * 100}%</p>
                    <p><strong>최종 유사도:</strong> {result.final_similarity * 100}%</p>
                </div>
            )}
        </div>
    );
}

export default PracticePage;