import React from "react";
import Header from "../components/Header";

const MusicPage = () => {
  return (
    <div className="container">
        <Header />
        
        <div>
            <p>음원 목록 페이지</p>
            <br />
            <button>음원 파일 추가</button>
        </div>
    </div>
  );
};

export default MusicPage;
