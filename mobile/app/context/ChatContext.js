import React, { createContext, useContext, useEffect, useState } from 'react';
import socket from '../../lib/socket';

const ChatContext = createContext();

export const ChatProvider = ({ children, user }) => {
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    if (!user) return;

    socket.connect();
    socket.emit('registerUser', {
      user_id: user.id,
      userName: user.name,
      userRole: user.role,
    });

    socket.on('newMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const joinRoom = (roomId) => {
    socket.emit('joinRoom', { roomId });
    setRoomId(roomId);
  };

  const sendMessage = ({ message, receiverId }) => {
    socket.emit('sendMessage', {
      sender_id: user.id,
      receiver_id: receiverId,
      message,
      chatRoomId: roomId,
      senderName: user.name,
      senderRole: user.role,
    });
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, joinRoom, roomId }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
export default ChatProvider; // ✅ Fix: add default export

