import React, { useState } from "react";
import axios from "axios"; 

import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import styles from "../styles/LoginPage.module.css";

const LoginPage = () => {
  const [ID, setID] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    // 1️⃣ 테스트 계정 로그인
    if (ID === "test" && password === "password") {
      localStorage.setItem("isAuthenticated", "true");
      navigate("/main");
      return;
    }
  
    // 2️⃣ B 연동 로그인
    const formData = new FormData();
    formData.append("username", ID);
    formData.append("password", password);
  
    try {
      const response = await axios.post("http://localhost:8000/login/", formData);
      console.log("✅ 로그인 성공:", response.data);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user_id", response.data.user_id);
      navigate("/main");
    } catch (error) {
      console.error("❌ 로그인 실패:", error);
      alert("잘못된 ID 또는 비밀번호입니다.");
    }
  };
  

  return (
    <LoginForm
      title="Login"
      fields={[
        { label: "ID", type: "text", value: ID, onChange: (e) => setID(e.target.value) },
        { label: "Password", type: "password", value: password, onChange: (e) => setPassword(e.target.value) },
      ]}
      buttonText="Login"
      onSubmit={handleLogin}
      footer={
        <div>
          <div className={styles.links}>
            <p onClick={() => navigate("/login")} className={styles.forgot}>Forget password?</p>
            <p onClick={() => navigate("/signup")} className={styles.register}>Sign up</p>
          </div>
          
          <br />
          <span className={styles.test}>
            테스트 아이디: test<br />
            테스트 패스워드: password
          </span>
        </div>
      }
    />
  );
};

export default LoginPage;
