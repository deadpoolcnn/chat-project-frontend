import React, { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";
import { Box, Typography, Button } from "@mui/material";

const LoginPage = () => {
  const navigate = useNavigate();
  return (
    <Box maxWidth={400} mx="auto" p={4} sx={{ background: '#fff', borderRadius: 2, boxShadow: 2, mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom fontWeight="bold">欢迎使用加密聊天系统</Typography>
      <Login />
      <Box mt={2} textAlign="center">
        <Typography variant="body2" component="span">没有账号？</Typography>
        <Button onClick={() => navigate("/register")} variant="text" color="primary" sx={{ ml: 1 }}>注册</Button>
      </Box>
    </Box>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  return (
    <Box maxWidth={400} mx="auto" p={4} sx={{ background: '#fff', borderRadius: 2, boxShadow: 2, mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom fontWeight="bold">注册新账号</Typography>
      <Register />
      <Box mt={2} textAlign="center">
        <Typography variant="body2" component="span">已有账号？</Typography>
        <Button onClick={() => navigate("/")} variant="text" color="primary" sx={{ ml: 1 }}>登录</Button>
      </Box>
    </Box>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.username) {
      navigate("/chat", { replace: true });
    } else if (location.pathname === "/register") {
      // do nothing, stay on register
    } else {
      navigate("/", { replace: true }); // 强制回到登录页
    }
  }, [navigate, location.pathname]);

  if (location.pathname === "/register") {
    return <RegisterPage />;
  }
  return <LoginPage />;
};

export default Home;
