import React, { useState } from "react";
import { addFriend } from "../../api";
import { Box, TextField, Button } from "@mui/material";

const AddFriend = ({ onAdd }) => {
  const [friendName, setFriendName] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    // Get current logged-in user
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.username) {
      setError("Please login first");
      return;
    }
    try {
        // Add friend logic, pass username and friendName
        const res = await addFriend({ username: user.username, friendName: friendName });
        onAdd && onAdd(res.data?.data || []);
        setFriendName("");
    } catch (err) {
        setError( err.response?.data?.message || "Failed to add friend, please try again");
        setFriendName("");
        return;
    }
  };
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, mt: 2, flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField value={friendName} onChange={e => setFriendName(e.target.value)} label="Friend's Username" size="small" required sx={{ flex: 1 }} />
        <Button type="submit" variant="contained" color="primary">Add</Button>
      </Box>
      {error && <Box sx={{ color: 'red', fontSize: 14 }}>{error}</Box>}
    </Box>
  );
};
export default AddFriend;
