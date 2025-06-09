import React from "react";
import { List, ListItem, ListItemText, Typography } from "@mui/material";

const MessageList = ({ messages }) => (
  <List className="flex-1 overflow-y-auto bg-gray-50 rounded p-2">
    {messages.map((msg, i) => (
      <ListItem key={i} className="mb-2 rounded hover:bg-gray-100">
        <ListItemText
          primary={<Typography variant="body2"><b>{msg.from_user}:</b> {msg.ciphertext || msg.text}</Typography>}
        />
      </ListItem>
    ))}
  </List>
);

export default MessageList;
