import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import styles from "../styles/SignUpPage.module.css";

const SignUpPage = () => {
    const [email, setEmail] = useState("");
    const [ID, setID] = useState("");
    const [password, setPassword] = useState("");
    const [checkPW, setCheckPW] = useState("");
    const navigate = useNavigate();
  
    const handleSignUp = () => {
        // 간단한 로그인 로직 (실제 프로젝트에서는 인증 API 사용)
    //   if (email === "test@example.com" && password === "password") {
    //     localStorage.setItem("isAuthenticated", "true");
    //     navigate("/login");
    //   } else {
    //     alert("잘못된 이메일 또는 비밀번호입니다.");
    //   }
        navigate("/");
    };
  
    return (
      <LoginForm
        title="SignUp"
        fields={[
          { label: "Email", type: "text", value: email, onChange: (e) => setEmail(e.target.value) },
          { label: "ID", type: "text", value: ID, onChange: (e) => setID(e.target.value) },
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
