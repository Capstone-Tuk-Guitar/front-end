import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    if (!authStatus && window.location.pathname !== "/signup") {
      navigate("/");
    }
  }, [navigate]);

  return <AppRoutes />;
};

export default App;
