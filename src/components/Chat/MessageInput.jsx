import React, { useState } from "react";
import { sendMessage } from "../../api";
import { encryptAndSignMessage } from "../../utils/crypto";
import { Box, TextField, Button } from "@mui/material";

const MessageInput = ({ onSend, receiverPublicKeyPem, currentFriend }) => {
  const [text, setText] = useState("");
  const handleSend = async e => {
    e.preventDefault();
    // 获取当前用户和私钥
    const user = JSON.parse(localStorage.getItem("user"));
    const senderPrivateKeyPem = localStorage.getItem("privateKey");
    if (!user || !senderPrivateKeyPem || !receiverPublicKeyPem) {
      alert("密钥信息缺失，无法发送消息");
      return;
    }
    // 加密与签名
    const encrypted = await encryptAndSignMessage({
      plainText: text,
      receiverPublicKeyPem,
      senderPrivateKeyPem
    });
    const msg = {
      from_user: user.username,
      to_user: currentFriend?.username || "guest", // 你可根据实际传参
      ...encrypted
    };
    console.log("发送的消息：", msg);
    await sendMessage(msg);
    onSend && onSend(msg);
    setText("");
  };
  return (
    <Box component="form" onSubmit={handleSend} className="flex gap-2">
      <TextField value={text} onChange={e => setText(e.target.value)} placeholder="输入消息..." size="small" fullWidth required />
      <Button type="submit" variant="contained" color="primary">发送</Button>
    </Box>
  );
};
export default MessageInput;
