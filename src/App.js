import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  const [, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(authStatus === "true");
    if (!authStatus && window.location.pathname !== "/signup") {
      navigate("/login");
    }
  }, [navigate]);

  return <AppRoutes />;
};

export default App;
