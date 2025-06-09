import React, { useState } from "react";
import { login } from "../../api";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    // 登录逻辑
    try {
      await login(form);
      // 登录成功后保存用户名到localStorage
      const lastUser = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem("user", JSON.stringify({ username: form.username }));
      navigate("/chat");
    } catch (err) {
      // 可根据需要添加错误提示
      alert("登录失败，请检查用户名或密码");
    }
  };
  return (
    <Box component="form" onSubmit={handleSubmit} className="space-y-4">
      <Typography variant="h6" className="font-semibold">登录</Typography>
      <TextField name="username" label="用户名" value={form.username} onChange={handleChange} fullWidth required size="small" />
      <TextField name="password" type="password" label="密码" value={form.password} onChange={handleChange} fullWidth required size="small" />
      <Button type="submit" variant="contained" color="primary" fullWidth className="mt-2">登录</Button>
    </Box>
  );
};
export default Login;
