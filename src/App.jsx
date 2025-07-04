import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";
import KeysPage from "./pages/KeysPage";

function RequirePrivateKey({ children }) {
  const hasPrivateKey = !!localStorage.getItem("privateKey") || !!localStorage.getItem("user");
  return hasPrivateKey ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Home initialPage="register" />} />
        <Route path="/chat" element={<RequirePrivateKey><ChatPage /></RequirePrivateKey>} />
        <Route path="/keys" element={<KeysPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
