import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import LoginForm from "../components/LoginForm";
import styles from "../styles/SignUpPage.module.css";

const SignUpPage = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [checkPW, setCheckPW] = useState("");
    const navigate = useNavigate();
  
    const handleSignUp = async () => {
      if (password !== checkPW) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }
    
      const formData = new FormData();
      formData.append("email", email);
      formData.append("username", username);
      formData.append("password", password);
    
      try {
        const response = await axios.post("http://localhost:8000/create-user/", formData);
        console.log("✅ 사용자 등록 성공:", response.data);
    
        alert("회원가입이 완료되었습니다!");
        navigate("/");  // 로그인 페이지로 이동

      } catch (error) {
        console.error("❌ 사용자 등록 실패:", error);
        if (error.response) {
          console.log("응답 상태 코드:", error.response.status);
          console.log("서버 메시지:", error.response.data);
        } else if (error.request) {
          console.log("요청은 보냈지만 응답이 없음:", error.request);
        } else {
          console.log("설정 중 에러 발생:", error.message);
        }
      
        alert("회원가입에 실패했습니다. 서버를 확인해주세요.");
      }
    }
  
    return (
      <LoginForm
        title="SignUp"
        fields={[
          { label: "Email", type: "text", value: email, onChange: (e) => setEmail(e.target.value) },
          { label: "username", type: "text", value: username, onChange: (e) => setUsername(e.target.value) },
          { label: "Password", type: "password", value: password, onChange: (e) => setPassword(e.target.value) },
          { label: "Re-enter Password", type: "password", value: checkPW, onChange: (e) => setCheckPW(e.target.value) },
        ]}
        buttonText="SignUp"
        onSubmit={handleSignUp}
        footer={
          <div>
            <br />
            <span className={styles.test}>
              테스트 이메일: test@example.com<br />
              테스트 아이디: test<br />
              테스트 패스워드: password
            </span>
          </div>
        }
      />
    );
};

export default SignUpPage;
