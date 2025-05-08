import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import LoginForm from "../components/LoginForm";
import styles from "../styles/LoginPage.module.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    // 테스트 계정 로그인
    if (username === "test" && password === "password") {
      localStorage.setItem("isAuthenticated", "true");
      navigate("/main");
      alert("테스트 계정입니다.");
      return;
    }

    // DB 연동 로그인
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
  
    try {
      const response = await axios.post("http://localhost:8000/login/", formData);
      console.log("✅ 로그인 성공:", response.data);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user_id", response.data.user_id);
      navigate("/main");
    } catch (error) {
      console.error("❌ 로그인 실패:", error);
      alert("잘못된 username 또는 비밀번호입니다.");
    }
  };

  return (
    <LoginForm
      title="Login"
      fields={[
        { label: "username", type: "text", value: username, onChange: (e) => setUsername(e.target.value) },
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
