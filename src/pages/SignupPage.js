import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/LoginPage.module.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    // 간단한 로그인 로직 (실제 프로젝트에서는 인증 API 사용)
    if (email === "test@example.com" && password === "password") {
      localStorage.setItem("isAuthenticated", "true");
      navigate("/");
    } else {
      alert("잘못된 이메일 또는 비밀번호입니다.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>로고</div>
      <div className={styles.loginBox}>
        <label>Email</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <br/>
        <label>Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button onClick={handleLogin}>Register</button>
      </div>
    </div>
  );
};

export default LoginPage;