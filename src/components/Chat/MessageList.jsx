import React, { useState } from "react";
import { List, ListItem, ListItemText, Typography, Button } from "@mui/material";
import { rsaDecryptAesKey, aesDecrypt, checkKeyPair } from "../../utils/crypto";

const MessageList = ({ messages }) => {
  const [decrypted, setDecrypted] = useState({}); // {msgIndex: plainText}
  const currentUser = JSON.parse(localStorage.getItem("user"))?.username;

  const handleToggleDecrypt = async (msg, idx) => {
    if (decrypted[idx] !== undefined) {
      // Already decrypted, click to show ciphertext
      setDecrypted(d => {
        const newD = { ...d };
        delete newD[idx];
        return newD;
      });
      return;
    }
    // Not decrypted, click to decrypt
    try {
      const privateKeyPem = localStorage.getItem("privateKey");
      const publicKeyPem = localStorage.getItem("publicKey");
      if (!privateKeyPem || !publicKeyPem) return;
      // First, check if the key pair matches
      const isPair = await checkKeyPair(privateKeyPem, publicKeyPem);
      if (!isPair) return;
      // Use local RSA private key to decrypt AES key
      const aesKey = await rsaDecryptAesKey(msg.encrypted_key, privateKeyPem);
      const plainText = await aesDecrypt(msg.ciphertext, aesKey, msg.iv);
      setDecrypted(d => ({ ...d, [idx]: plainText }));
    } catch {
      setDecrypted(d => ({ ...d, [idx]: "[Decryption failed]" }));
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
                    {decrypted[i] !== undefined ? "Cipher" : "Decrypt"}
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
