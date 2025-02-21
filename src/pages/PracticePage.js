import React, { useState } from "react";
import axios from "axios";
import Header from "../components/Header";

function PracticePage() {
    const [svgContent1, setSvgContent1] = useState("");
    const [svgContent2, setSvgContent2] = useState("");
    const [accuracy, setAccuracy] = useState(null);

    const handleUpload = async (event, setSvgContent) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            // FastAPI 백엔드로 MIDI 파일 전송
            const response = await axios.post("http://localhost:8000/convert-midi/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                responseType: "text", // SVG를 텍스트로 받음
            });

            setSvgContent(response.data);
        } catch (error) {
            console.error("Error converting MIDI:", error);
        }
    };

    const handleCompare = () => {
        // 백엔드에서 비교 작업을 할 예정이므로 임시로 정확도를 85%로 설정
        setAccuracy("85%");
    };

    return (
        <div className="container">
            <Header />
            <h1>MIDI 파일끼리 비교</h1>
            
            <input type="file" accept=".mid" onChange={(e) => handleUpload(e, setSvgContent1)} />
            {svgContent1 && <div dangerouslySetInnerHTML={{ __html: svgContent1 }} />}
            
            <input type="file" accept=".mid" onChange={(e) => handleUpload(e, setSvgContent2)} />
            {svgContent2 && <div dangerouslySetInnerHTML={{ __html: svgContent2 }} />}

            <button onClick={handleCompare}>비교하기</button>

            {accuracy && <p>정확도: {accuracy}</p>}
        </div>
    );
}

export default PracticePage;