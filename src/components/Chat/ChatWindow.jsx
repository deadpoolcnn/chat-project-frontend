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
      // 先判断公钥和私钥是否配对
      const isPair = await checkKeyPair(privateKeyPem, publicKeyPem);
      console.log("公钥和私钥配对结果：", isPair);
      if (!isPair) {
        return { ...msg, plainText: '[公钥和私钥不匹配，无法解密]' };
      }
      // 1. 解密AES密钥
      const aesKey = await rsaDecryptAesKey(msg.encrypted_key, privateKeyPem);
      const plainText = await aesDecrypt(msg.ciphertext, aesKey, msg.iv);
      return { ...msg, plainText };
    } catch {
      return { ...msg, plainText: '[解密失败]' };
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
        // 解密每条消息
        const decryptedMsgs = await Promise.all(msgs.map(msg => decryptMessage(msg, privateKeyPem, publicKeyPem)));
        setMessages(decryptedMsgs);
      })
      .catch(() => setMessages([]));
  }, [currentFriend]);

  // TODO: 拉取消息、加解密、签名验证等
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
