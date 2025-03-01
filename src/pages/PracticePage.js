import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import Header from "../components/Header";

function PracticePage() {
    // 페이지 이동 함수
    const navigate = useNavigate();

    // 카드 클릭 시 이동
    const handleClick = () => {
        navigate("/accuracy");   // MusicPage로 이동
    }

    const [midiFile, setMidiFile] = useState(null);
    const [svgData, setSvgData] = useState(null);

    const handleFileChange = (event) => {
        setMidiFile(event.target.files[0]);
    };

    const handleConvertToSVG = async () => {
        if (!midiFile) {
            alert("MIDI 파일을 업로드하세요.");
            return;
        }

        const formData = new FormData();
        formData.append("file", midiFile);

        try {
            const response = await axios.post("http://localhost:8000/midi-to-svg/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setSvgData(response.data); // SVG 데이터 저장
        } catch (error) {
            console.error("SVG 변환 실패:", error);
            alert("SVG 변환 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="container">
            <Header />

            <div>
                <input type="file" accept=".midi" onChange={handleFileChange} />
                <br />
                <button onClick={handleConvertToSVG}>SVG 변환</button>

                {svgData && (
                    <div>
                        <h3>변환된 악보</h3>
                        <div dangerouslySetInnerHTML={{ __html: svgData }} />
                    </div>
                )}
                <br />
                <br />
                <br />

                <button onClick={handleClick}>MIDI 파일 비교하기</button>
            </div>
        </div>
    );
}

export default PracticePage;