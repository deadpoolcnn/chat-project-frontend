import React, { useState } from "react";
import { sendMessage } from "../../api";
import { encryptAndSignMessage } from "../../utils/crypto";
import { Box, TextField, Button } from "@mui/material";

const MessageInput = ({ onSend, receiverPublicKeyPem, currentFriend }) => {
  const [text, setText] = useState("");
  const handleSend = async e => {
    e.preventDefault();
    // Get current user and private key
    const user = JSON.parse(localStorage.getItem("user"));
    const senderPrivateKeyPem = localStorage.getItem("privateKey");
    if (!user || !senderPrivateKeyPem || !receiverPublicKeyPem) {
      alert("Missing key information, cannot send message");
      return;
    }
    // Encrypt and sign
    const encrypted = await encryptAndSignMessage({
      plainText: text,
      receiverPublicKeyPem,
      senderPrivateKeyPem
    });
    const msg = {
      from_user: user.username,
      to_user: currentFriend?.username || "guest",
      PublicKeyPem: receiverPublicKeyPem,
      ...encrypted
    };
    await sendMessage(msg);
    onSend && onSend(msg);
    setText("");
  };
  return (
    <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', gap: 2, p: 2, alignItems: 'center', bgcolor: '#fafbfc', borderRadius: 2 }}>
      <TextField value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." size="small" fullWidth required sx={{ bgcolor: '#fff' }} />
      <Button type="submit" variant="contained" color="primary" sx={{ minWidth: 90 }}>Send</Button>
    </Box>
  );
};
export default MessageInput;
