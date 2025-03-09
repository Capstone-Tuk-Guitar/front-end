import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import styles from "../styles/LoginPage.module.css";

const LoginPage = () => {
  const [ID, setID] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (ID === "test" && password === "password") {
      localStorage.setItem("isAuthenticated", "true");
      navigate("/main");
    } else {
      alert("잘못된 이메일 또는 비밀번호입니다.");
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
