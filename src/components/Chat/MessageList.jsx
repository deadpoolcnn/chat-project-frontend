import React, { useState } from "react";
import { List, ListItem, ListItemText, Typography, Button } from "@mui/material";
import { rsaDecryptAesKey, aesDecrypt, checkKeyPair } from "../../utils/crypto";

const MessageList = ({ messages }) => {
  const [decrypted, setDecrypted] = useState({}); // {msgIndex: plainText}
  const currentUser = JSON.parse(localStorage.getItem("user"))?.username;

  const handleToggleDecrypt = async (msg, idx) => {
    if (decrypted[idx] !== undefined) {
      // 已解密，点击后恢复密文
      setDecrypted(d => {
        const newD = { ...d };
        delete newD[idx];
        return newD;
      });
      return;
    }
    // 未解密，点击后解密
    try {
      const privateKeyPem = localStorage.getItem("privateKey");
      const publicKeyPem = localStorage.getItem("publicKey");
      if (!privateKeyPem || !publicKeyPem) return;
      // 先验证公私钥是否配对
      const isPair = await checkKeyPair(privateKeyPem, publicKeyPem);
      if (!isPair) return;
      // 用本地RSA private key解密AES key
      const aesKey = await rsaDecryptAesKey(msg.encrypted_key, privateKeyPem);
      const plainText = await aesDecrypt(msg.ciphertext, aesKey, msg.iv);
      setDecrypted(d => ({ ...d, [idx]: plainText }));
    } catch {
      setDecrypted(d => ({ ...d, [idx]: "[解密失败]" }));
    }
  };

  return (
    <List className="flex-1 overflow-y-auto bg-gray-50 rounded p-2">
      {messages.map((msg, i) => (
        <ListItem key={i} className="mb-2 rounded hover:bg-gray-100" alignItems="flex-start">
          <ListItemText
            primary={
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" component="span">
                  <b>{msg.from_user}:</b> {decrypted[i] !== undefined
                    ? decrypted[i]
                    : (msg.ciphertext || msg.text)}
                </Typography>
                {msg.ciphertext && msg.from_user !== currentUser && (
                  <Button
                    size="small"
                    sx={{ ml: 2 }}
                    onClick={() => handleToggleDecrypt(msg, i)}
                  >
                    {decrypted[i] !== undefined ? "加密" : "解密"}
                  </Button>
                )}
              </span>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default MessageList;
