import React, { useState } from "react";
import FriendsList from "../components/Friends/FriendsList";
import ChatWindow from "../components/Chat/ChatWindow";

const ChatPage = () => {
  const [currentFriend, setCurrentFriend] = useState(null);
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <aside style={{ width: 250, borderRight: "1px solid #eee" }}>
        <FriendsList onSelect={setCurrentFriend} />
      </aside>
      <main style={{ flex: 1 }}>
        <ChatWindow currentFriend={currentFriend} />
      </main>
    </div>
  );
};

export default ChatPage;
