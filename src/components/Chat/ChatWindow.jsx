import React, { useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { Box, Paper } from "@mui/material";

const ChatWindow = ({ currentFriend }) => {
  const [messages, setMessages] = useState([]);
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
