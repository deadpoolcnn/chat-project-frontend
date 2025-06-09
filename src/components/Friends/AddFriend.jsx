import React, { useState } from "react";
import { addFriend } from "../../api";
import { Box, TextField, Button } from "@mui/material";

const AddFriend = ({ onAdd }) => {
  const [friendName, setFriendName] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    // 获取当前登录用户
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.username) {
      setError("请先登录");
      return;
    }
    try {
        // 添加好友逻辑，传递username和friend_name
        const res = await addFriend({ username: user.username, friendName: friendName });
        onAdd && onAdd(res.data?.data || []);
        setFriendName("");
    } catch (err) {
        setError( err.response?.data?.message || "添加好友失败，请重试");
        setFriendName("");
        return;
    }
    
  };
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, mt: 2, flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField value={friendName} onChange={e => setFriendName(e.target.value)} label="添加好友用户名" size="small" required sx={{ flex: 1 }} />
        <Button type="submit" variant="contained" color="primary">添加</Button>
      </Box>
      {error && <Box sx={{ color: 'red', fontSize: 14 }}>{error}</Box>}
    </Box>
  );
};
export default AddFriend;
