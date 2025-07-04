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
      setError("Passwords do not match");
      return;
    }
    try {
      // In real scenario: generate RSA key pair on frontend
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
      // Export RSA public and private keys (ArrayBuffer)
      const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
      const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
      // Convert to base64
      const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)));
      const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKey)));
      // PEM header/footer correction to standard PKCS8 format
      const pemHeader = "-----BEGIN PRIVATE KEY-----\n";
      const pemFooter = "\n-----END PRIVATE KEY-----";
      // Line break every 64 characters
      const privateKeyLines = privateKeyBase64.match(/.{1,64}/g).join("\n");
      const privateKeyPem = pemHeader + privateKeyLines + pemFooter;
      // Save RSA private key locally (PEM format)
      localStorage.setItem("privateKey", privateKeyPem);
      // Save RSA public key locally (PEM format, with header/footer)
      const publicKeyPem = [
        "-----BEGIN PUBLIC KEY-----",
        ...(publicKeyBase64.match(/.{1,64}/g) || []),
        "-----END PUBLIC KEY-----"
      ].join("\n");
      localStorage.setItem("publicKey", publicKeyPem);
      // Upload RSA public key (PEM format, with header/footer) during registration
      await register({
        username: form.username,
        password: form.password,
        public_key: publicKeyPem,
      });
      // Trigger browser download
      const blob = new Blob([privateKeyPem], { type: "application/x-pem-file" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `private_key_${form.username}.pem`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert("Registration successful. Your private key has been downloaded. Please keep it safe!");
      navigate("/login");
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" className="font-semibold">Register</Typography>
      <TextField name="username" label="Username" value={form.username} onChange={handleChange} fullWidth required size="small" sx={{ mb: 2 }} />
      <TextField name="password" type="password" label="Password" value={form.password} onChange={handleChange} fullWidth required size="small" sx={{ mb: 2 }} />
      <TextField name="confirmPassword" type="password" label="Confirm Password" value={form.confirmPassword} onChange={handleChange} fullWidth required size="small" sx={{ mb: 2 }} />
      {error && <Typography color="error">{error}</Typography>}
      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Register</Button>
    </Box>
  );
};
export default Register;
