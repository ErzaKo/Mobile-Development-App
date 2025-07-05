import React, { useEffect, useState } from 'react';
import { View, TextInput, FlatList, Text, Button } from 'react-native';
import axios from 'axios';
import { useChat } from '../app/context/ChatContext';

const ChatScreen = ({ user, receiver }) => {
  const [input, setInput] = useState('');
  const { messages, sendMessage, joinRoom } = useChat();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await axios.post('http://192.168.1.150:5002/api/chat/rooms/init', {
          userId1: user.id,
          userId2: receiver.id,
        });

        const roomId = res.data.chatRoomId;
        joinRoom(roomId);

        const messagesRes = await axios.get(`http://192.168.1.150:5002/api/chat/messages?roomId=${roomId}`);
        // Load initial messages from DB
        messagesRes.data.forEach(msg => {
          sendMessage(msg); // This will push to messages via context
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage({ message: input, receiverId: receiver.id });
      setInput('');
    }
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <Text style={{ marginVertical: 2 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.senderName}:</Text> {item.message}
          </Text>
        )}
      />
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Type your message"
        style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
};

export default ChatScreen;
