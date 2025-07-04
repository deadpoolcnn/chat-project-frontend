import React, { useState } from "react";
import { login, getPublicKey } from "../../api";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [fileError, setFileError] = useState("");
  const [privateKey, setPrivateKey] = useState(localStorage.getItem("privateKey") || "");
  const navigate = useNavigate();
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target.result;
      if (!content.includes("-----BEGIN PRIVATE KEY-----") || !content.includes("-----END PRIVATE KEY-----")) {
        setFileError("Please select a valid PEM format private key file");
        return;
      }
      // PEM header/footer correction to standard PKCS8 format
      const pemHeader = "-----BEGIN PRIVATE KEY-----\n";
      const pemFooter = "\n-----END PRIVATE KEY-----";
      // Only keep base64 content
      const base64 = content.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
      const privateKeyLines = base64.match(/.{1,64}/g).join("\n");
      const privateKeyPem = pemHeader + privateKeyLines + pemFooter;
      localStorage.setItem("privateKey", privateKeyPem);
      setPrivateKey(privateKeyPem); // Update state immediately
      setFileError("");
      alert("Private key imported successfully!");
    };
    reader.readAsText(file);
  };
  const handleSubmit = async e => {
    e.preventDefault();
    // Check if username and password are filled
    if (!form.username || !form.password) {
      alert("Please enter your username and password");
      return;
    }
    // Login logic
    try {
      // Check if private key exists locally, if not, prompt to import
      if (!privateKey) {
        alert("No local private key detected. Please import your private key file (.pem) to decrypt messages!");
        // Show file upload control
        return;
      }
      await login(form);
      // After successful login, fetch and store public key
      const res = await getPublicKey({ username: form.username });
      const publicKey = res.data?.public_key;
      // console.log("Fetched public key:", publicKey);
      if (publicKey) {
        localStorage.setItem("publicKey", publicKey);
      }
      // After successful login, save username to localStorage
      localStorage.setItem("user", JSON.stringify({ username: form.username }));
      navigate("/chat");
    } catch (err) {
      // Add error prompt if needed
      alert("Login failed. Please check your username or password.");
    }
  };
  return (
    <Box component="form" onSubmit={handleSubmit} className="space-y-4">
      <Typography variant="h6" className="font-semibold">Login</Typography>
      <TextField name="username" label="Username" value={form.username} onChange={handleChange} fullWidth required size="small" sx={{ mb: 2 }} />
      <TextField name="password" type="password" label="Password" value={form.password} onChange={handleChange} fullWidth required size="small" sx={{ mb: 2 }} />
      <Button type="submit" variant="contained" color="primary" fullWidth className="mt-2">Login</Button>
      {/* Private key import area */}
      { !privateKey && (
        <Box sx={{ mt: 3 }}>
          <Typography color="error" sx={{ mb: 1 }}>Please upload your private key (.pem file) to complete login:</Typography>
          <input type="file" accept=".pem" onChange={handleFileChange} />
          {fileError && <Typography color="error">{fileError}</Typography>}
        </Box>
      )}
    </Box>
  );
};
export default Login;
