import React, { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";
import { Box, Typography, Button } from "@mui/material";

const LoginPage = () => {
  const navigate = useNavigate();
  return (
    <Box maxWidth={400} mx="auto" p={4} sx={{ background: '#fff', borderRadius: 2, boxShadow: 2, mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom fontWeight="bold">Welcome to the Encrypted Chat System</Typography>
      <Login />
      <Box mt={2} textAlign="center">
        <Typography variant="body2" component="span">Don't have an account?</Typography>
        <Button onClick={() => navigate("/register")} variant="text" color="primary" sx={{ ml: 1 }}>Register</Button>
      </Box>
    </Box>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  return (
    <Box maxWidth={400} mx="auto" p={4} sx={{ background: '#fff', borderRadius: 2, boxShadow: 2, mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom fontWeight="bold">Register a New Account</Typography>
      <Register />
      <Box mt={2} textAlign="center">
        <Typography variant="body2" component="span">Already have an account?</Typography>
        <Button onClick={() => navigate("/")} variant="text" color="primary" sx={{ ml: 1 }}>Login</Button>
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
      navigate("/", { replace: true }); // Force back to login page
    }
  }, [navigate, location.pathname]);

  if (location.pathname === "/register") {
    return <RegisterPage />;
  }
  return <LoginPage />;
};

export default Home;
