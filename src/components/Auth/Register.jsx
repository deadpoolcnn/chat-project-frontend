import React, { useState } from "react";
import { register } from "../../api";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
      // 导出RSA公钥和RSA私钥（ArrayBuffer）
      const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
      const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
      // 转为base64
      const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)));
      const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKey)));
      // PEM头尾修正为标准PKCS8格式
      const pemHeader = "-----BEGIN PRIVATE KEY-----\n";
      const pemFooter = "\n-----END PRIVATE KEY-----";
      // 每64字符换行
      const privateKeyLines = privateKeyBase64.match(/.{1,64}/g).join("\n");
      const privateKeyPem = pemHeader + privateKeyLines + pemFooter;
      // 本地保存RSA私钥（PEM格式）
      localStorage.setItem("privateKey", privateKeyPem);
      // 本地保存RSA公钥（PEM格式，带头尾）
      const publicKeyPem = [
        "-----BEGIN PUBLIC KEY-----",
        ...(publicKeyBase64.match(/.{1,64}/g) || []),
        "-----END PUBLIC KEY-----"
      ].join("\n");
      localStorage.setItem("publicKey", publicKeyPem);
      // 注册时上传RSA公钥（PEM格式，带头尾）
      await register({
        username: form.username,
        password: form.password,
        public_key: publicKeyPem,
      });
      // 触发浏览器下载
      const blob = new Blob([privateKeyPem], { type: "application/x-pem-file" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `private_key_${form.username}.pem`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert("注册成功，私钥已自动下载，请妥善保存！");
      navigate("/chat");
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
