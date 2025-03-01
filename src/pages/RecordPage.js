import React from 'react';
import Header from "../components/Header";

function PracticeRecordPage() {
  const records = [
    { id: 1, title: '곡1', duration: '3분 12초', date: '2025-01-01' },
    { id: 2, title: '곡2', duration: '5분 10초', date: '2025-01-05' },
  ];

  return (
    <div className="container">
      <Header />

      <div>
        <h1>연주 기록</h1>
        <ul>
          {records.map((record) => (
            <li key={record.id}>
              {record.title} - {record.duration} ({record.date})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PracticeRecordPage;
