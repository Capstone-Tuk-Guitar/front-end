import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import styles from "../styles/DetailDiffPage.module.css";

function DetailDiffPage() {
    const location = useLocation();
    const { file1, file2 } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [diffResult, setDiffResult] = useState(null);

    useEffect(() => {
        if (file1 && file2) {
            const compareFiles = async () => {
                setLoading(true);
                const formData = new FormData();
                formData.append("file1", file1);
                formData.append("file2", file2);

                try {
                    const response = await axios.post("http://localhost:8000/compare/detail/", formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                    setDiffResult(response.data);
                } catch (error) {
                    console.error("비교 실패:", error);
                    alert("비교 중 오류가 발생했습니다.");
                }
                setLoading(false);
            };

            compareFiles();
        }
    }, [file1, file2]);

    return (
        <div className="container">
            <Header />

            <div className={styles.container}>
                <h1>세부 비교 결과</h1>
                {loading ? (
                    <p>비교 중...</p>
                ) : (
                    <div>
                        {diffResult ? (
                            <div className={styles.detailBox}>
                                <div className={styles.section}>
                                    <h2>피치 차이</h2>
                                    <div className={styles.scrollBox}>
                                        <ul>
                                            {Array.isArray(diffResult["음 높낮이 차이"]) &&
                                                diffResult["음 높낮이 차이"].map((diff, index) => (
                                                    <li key={index}>
                                                        음표 번호: {diff["차이 나는 음표 번호"]} <br />
                                                        1번째 파일 값: {diff["1번째 파일 값"]} <br />
                                                        2번째 파일 값: {diff["2번째 파일 값"]} <br />
                                                        시간: {diff["시간"]}초
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className={styles.section}>
                                    <h2>리듬 차이</h2>
                                    <div className={styles.scrollBox}>
                                        <ul>
                                            {Array.isArray(diffResult["리듬 차이"]) &&
                                                diffResult["리듬 차이"].map((diff, index) => (
                                                    <li key={index}>
                                                        음표 번호: {diff["차이 나는 음표 번호"]} <br />
                                                        1번째 파일 값: {diff["1번째 파일 음정"]} <br />
                                                        2번째 파일 값: {diff["2번째 파일 음정"]} <br />
                                                        시간: {diff["시간"]}초
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className={styles.section}>
                                    <h2>멜로디 간격 차이 </h2>
                                    <div className={styles.scrollBox}>
                                        <ul>
                                            {Array.isArray(diffResult["멜로디 간격 차이"]) &&
                                                diffResult["멜로디 간격 차이"].map((diff, index) => (
                                                    <li key={index}>
                                                        음표 번호: {diff["차이 나는 음표 번호"]} <br />
                                                        1번째 파일 값: {diff["1번째 파일 멜로디"]} <br />
                                                        2번째 파일 값: {diff["2번째 파일 멜로디"]} <br />
                                                        시간: {diff["시간"]}초
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p>비교 결과가 없습니다.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DetailDiffPage;