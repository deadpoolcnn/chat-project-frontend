import React, { useState } from "react";
import { register } from "../../api";
import { Box, TextField, Button, Typography } from "@mui/material";

const Register = () => {
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    try {
      // 真实场景：前端生成RSA密钥对
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );
      // 导出公钥和私钥
      const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
      const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
      // 转为base64
      const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)));
      const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKey)));
      // 本地保存私钥
      localStorage.setItem("privateKey", privateKeyBase64);
      // 注册时上传公钥
      await register({
        username: form.username,
        password: form.password,
        public_key: publicKeyBase64,
      });
      alert("注册成功，私钥已存储到本地！");
      // 可跳转到登录或主页
    } catch (err) {
      setError("注册失败，请重试");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" className="font-semibold">注册</Typography>
      <TextField name="username" label="用户名" value={form.username} onChange={handleChange} fullWidth required size="small" sx={{ mb: 2 }} />
      <TextField name="password" type="password" label="密码" value={form.password} onChange={handleChange} fullWidth required size="small" sx={{ mb: 2 }} />
      <TextField name="confirmPassword" type="password" label="确认密码" value={form.confirmPassword} onChange={handleChange} fullWidth required size="small" sx={{ mb: 2 }} />
      {error && <Typography color="error">{error}</Typography>}
      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>注册</Button>
    </Box>
  );
};
export default Register;
