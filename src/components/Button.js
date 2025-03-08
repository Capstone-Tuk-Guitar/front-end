import React from "react";
import clsx from "clsx";
import styles from "../styles/Button.module.css";

const Button = ({ onClick, icon: Icon, children, className  }) => {
  return (
    <button className={clsx(styles.button, className)} onClick={onClick}>
      {Icon && <Icon className={styles.icon} />} {/* 아이콘이 있을 경우 표시 */}
      {children}
    </button>
  );
};

export default Button;
