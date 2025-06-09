import React, { useEffect, useState } from "react";
import { getFriends } from "../../api";
import AddFriend from "./AddFriend";
import { Box, List, ListItem, ListItemText, Typography, Divider } from "@mui/material";

const FriendsList = ({ onSelect }) => {
  const [friends, setFriends] = useState([]);
  const [username, setUsername] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // 从localStorage/sessionStorage获取登录用户名
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.username) {
      setUsername(user.username);
      getFriends({ username: user.username }).then(res => {
        // 兼容后端返回不是数组的情况
        console.log("获取好友列表:", res.data.data);
        let data = res.data?.data || [];
        if (!Array.isArray(data)) {
          data = [];
        }
        setFriends(data);
      });
    }
  }, []);

  return (
    <Box sx={{ p: 2, bgcolor: '#fff', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>好友列表</Typography>
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
      <AddFriend onAdd={f => setFriends(v => {
        console.log("添加好友:", f);
        // 确保添加的好友不重复
        if (v.some(existing => existing.username === f.username)) {
          return v;
        }
        return [...v, f];
      })} />
    </Box>
  );
};
export default FriendsList;
