import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from "../components/Header";
import styles from "../styles/RecordPage.module.css";  // CSS 따로 관리

function RecordPage() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        alert("로그인이 필요합니다.");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/get-records/${userId}`);
        setRecords(response.data);
      } catch (error) {
        console.error("기록 불러오기 실패:", error);
        alert("기록을 불러오는 중 오류가 발생했습니다.");
      }
    };

    fetchRecords();
  }, []);

  // music_title 기준으로 묶기
  const groupedRecords = records.reduce((acc, record) => {
    if (!acc[record.music_title]) {
      acc[record.music_title] = [];
    }
    acc[record.music_title].push(record);
    return acc;
  }, {});

  return (
    <div className="container">
      <Header />

      <div className={styles.pageContainer}>
        <h1>연주 기록</h1>

        {Object.keys(groupedRecords).length === 0 ? (
          <p>기록이 없습니다.</p>
        ) : (
          Object.entries(groupedRecords).map(([title, recordList]) => (
            <div key={title} className={styles.recordGroup}>
              <h2 className={styles.title}>{title}</h2>
              <ul className={styles.recordList}>
                {recordList.map((record) => (
                  <li key={record.record_id} className={styles.recordItem}>
                    <span className={styles.file}>{record.record_file}</span>
                    <span className={styles.accuracy}>정확도: {record.accuracy}%</span>
                    <span className={styles.date}>{new Date(record.record_date).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RecordPage;
