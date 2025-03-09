import React from "react";
import styles from "../styles/LoginForm.module.css";

const LoginForm = ({ title, fields, buttonText, onSubmit, footer }) => {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>Capstone-Tuk-Guitar</div>
      <div className={styles.loginBox}>
        {fields.map(({ label, type, value, onChange }) => (
          <div className={styles.inputGroup} key={label}>
            <label>{label}</label>
            <input type={type} value={value} onChange={onChange} />
          </div>
        ))}
        <button onClick={onSubmit}>{buttonText}</button>
        {footer}
      </div>
    </div>
  );
};

export default LoginForm;
