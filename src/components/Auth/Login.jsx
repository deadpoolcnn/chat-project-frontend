import React, { useState } from "react";
import { login } from "../../api";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [fileError, setFileError] = useState("");
  const navigate = useNavigate();
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target.result;
      if (!content.includes("-----BEGIN PRIVATE KEY-----") || !content.includes("-----END PRIVATE KEY-----")) {
        setFileError("请选择正确的PEM格式私钥文件");
        return;
      }
      // 只保留 base64 内容
      const base64 = content.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
      localStorage.setItem("privateKey", base64);
      setFileError("");
      alert("私钥导入成功！");
      navigate("/chat");
    };
    reader.readAsText(file);
  };
  const handleSubmit = async e => {
    e.preventDefault();
    // 登录逻辑
    try {
      await login(form);
      // 登录成功后保存用户名到localStorage
      const lastUser = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem("user", JSON.stringify({ username: form.username }));
      // 检查本地是否有私钥，没有则引导导入
      if (!localStorage.getItem("privateKey")) {
        alert("未检测到本地私钥，请导入您的私钥文件（.pem），否则无法解密消息！");
        // 展示文件上传控件
        return;
      }
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
      {/* 私钥导入区域 */}
      { !localStorage.getItem("privateKey") && (
        <Box sx={{ mt: 3 }}>
          <Typography color="error" sx={{ mb: 1 }}>请上传您的私钥（.pem文件）以完成登录：</Typography>
          <input type="file" accept=".pem" onChange={handleFileChange} />
          {fileError && <Typography color="error">{fileError}</Typography>}
        </Box>
      )}
    </Box>
  );
};
export default Login;
