import React, { useEffect, useState } from "react";
import { getFriends } from "../../api";
import AddFriend from "./AddFriend";
import { Box, List, ListItem, ListItemText, Typography, Divider } from "@mui/material";

const FriendsList = ({ onSelect }) => {
  const [friends, setFriends] = useState([]);
  const [username, setUsername] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // Get logged-in username from localStorage/sessionStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.username) {
      setUsername(user.username);
      fetchFriends(user.username);
    }
  }, []);

  // Fetch friends list helper
  const fetchFriends = (username) => {
    getFriends({ username }).then(res => {
      let data = res.data?.data || [];
      if (!Array.isArray(data)) {
        data = [];
      }
      setFriends(data);
    });
  };

  return (
    <Box sx={{ p: 2, bgcolor: '#fff', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Friends List</Typography>
      <List dense sx={{ flex: 1, overflowY: 'auto' }}>
        {friends?.map((f, idx) => (
          <ListItem
            key={f.user_id || f.username || idx}
            sx={{ borderRadius: 1, '&:hover': { bgcolor: 'grey.100' }, bgcolor: selected === f.username ? 'grey.200' : undefined }}
            button
            selected={selected === f.username}
            onClick={() => {
              setSelected(f.username);
              onSelect && onSelect(f);
            }}
          >
            <ListItemText primary={f.username} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <AddFriend onAdd={() => fetchFriends(username)} />
    </Box>
  );
};
export default FriendsList;
