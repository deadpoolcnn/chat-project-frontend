import React, { useState, useEffect } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { Box, Paper } from "@mui/material";
import { getMessages } from "../../api";
import { rsaDecryptAesKey, aesDecrypt, checkKeyPair } from "../../utils/crypto";

const ChatWindow = ({ currentFriend }) => {
  const [messages, setMessages] = useState([]);

  async function decryptMessage(msg, privateKeyPem, publicKeyPem) {
    try {
      // Check if public and private keys match
      const isPair = await checkKeyPair(privateKeyPem, publicKeyPem);
      if (!isPair) {
        return { ...msg, plainText: '[Public and private key do not match, cannot decrypt]' };
      }
      // 1. Decrypt AES key
      const aesKey = await rsaDecryptAesKey(msg.encrypted_key, privateKeyPem);
      const plainText = await aesDecrypt(msg.ciphertext, aesKey, msg.iv);
      return { ...msg, plainText };
    } catch {
      return { ...msg, plainText: '[Decryption failed]' };
    }
  }

  useEffect(() => {
    if (!currentFriend || !currentFriend.username) return;
    const user = JSON.parse(localStorage.getItem("user"));
    const privateKeyPem = localStorage.getItem("privateKey");
    const publicKeyPem = localStorage.getItem("publicKey");
    getMessages({ from_user: user?.username, to_user: currentFriend.username })
      .then(async res => {
        const msgs = res.data.data || [];
        if (!user || !user.username || !privateKeyPem || !publicKeyPem) {
          setMessages([]);
          return;
        }
        // Decrypt each message
        const decryptedMsgs = await Promise.all(msgs.map(msg => decryptMessage(msg, privateKeyPem, publicKeyPem)));
        setMessages(decryptedMsgs);
      })
      .catch(() => setMessages([]));
  }, [currentFriend]);

  // TODO: Fetch messages, encryption/decryption, signature verification, etc.
  return (
    <Paper elevation={2} className="flex flex-col h-full bg-white rounded shadow p-4">
      <Box className="flex-1 flex flex-col overflow-y-auto">
        <MessageList messages={messages} />
      </Box>
      <Box className="mt-2">
        <MessageInput
          onSend={msg => setMessages(v => [...v, msg])}
          receiverPublicKeyPem={currentFriend?.publicKey}
          currentFriend={currentFriend}
        />
      </Box>
    </Paper>
  );
};
export default ChatWindow;
