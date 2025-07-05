// livechat/chat.socket.js
const ChatRoom = require('./chat_rooms.model');
const ChatRoomParticipant = require('./chat_room_participants');
const ChatMessage = require('./chat_messages.model');
const ChatMessageMongo = require('./chatMessage.mongo');

const { findOrCreateRoomForUsers } = require('./chat.controller');
const userSocketMap = {}; // Map to track user_id to socket.id

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🟢 New client connected:', socket.id);

    socket.on('registerUser', ({ user_id, userName, userRole }) => {
      socket.user_id = user_id;
      socket.userName = userName;
      socket.userRole = userRole;
      userSocketMap[user_id] = socket.id;
    
      console.log(`✅ Registered user ${user_id} (${userName} - ${userRole}) with socket ${socket.id}`);
    });
    

    socket.on('joinRoom', async ({ roomId }) => {
      socket.join(roomId);
      console.log(`👥 Socket ${socket.id} manually joined room ${roomId}`);
    });

    socket.on('sendMessage', async ({ sender_id, receiver_id, message, chatRoomId, senderName, senderRole }) => {    
      try {
        const fromUserId = sender_id || socket.user_id;
        const toUserId = receiver_id;
    
        if (!fromUserId || !toUserId || !message) {
          console.error("❌ Missing required data:", { fromUserId, toUserId, message });
          return;
        }
    
        // ✅ Use provided chatRoomId, or fallback to finding/creating one
        let roomIdStr = chatRoomId;
        let room = null;
    
        if (!roomIdStr) {
          room = await findOrCreateRoomForUsers(fromUserId, toUserId);
          if (!room) {
            console.error("No room found or created for users", fromUserId, toUserId);
            return;
          }
          roomIdStr = room.id.toString();
        } else {
          room = await ChatRoom.findByPk(chatRoomId);
          if (!room) {
            console.error("❌ Provided chatRoomId does not exist:", chatRoomId);
            return;
          }
        }
    
        // 🔗 Join the room
        socket.join(roomIdStr);
        console.log(`🚪 Sender (${fromUserId}) joined room ${roomIdStr}`);
    
        // 📡 Receiver join
        const receiverSocketId = userSocketMap[toUserId];
        const receiverSocket = io.sockets.sockets.get(receiverSocketId);
        if (receiverSocket) {
          receiverSocket.join(roomIdStr);
          console.log(`🚪 Receiver (${toUserId}) is online and joined room ${roomIdStr}`);
        } else {
          console.log(`❗ Receiver (${toUserId}) is not online or not registered.`);
        }
    
        const socketsInRoom = await io.in(roomIdStr).fetchSockets();
        const participants = socketsInRoom.map(s => s.user_id || s.id);
        console.log(`👥 Sockets currently in room ${roomIdStr}:`, participants);
    
        // 📝 Save messages
        const mongoMessage = await ChatMessageMongo.create({
          room_id: room.id,
          sender_id: fromUserId,
          message,
        });
        console.log(`🧾 Saved message to MongoDB with ID ${mongoMessage._id}`);
    
        const pgMessage = await ChatMessage.create({
          room_id: room.id,
          sender_id: fromUserId,
          content: message,
          mongo_message_id: mongoMessage._id.toString(),
        });
        console.log(`🧾 Saved message to PostgreSQL with ID ${pgMessage.id}`);
    
        // 🚀 Emit message
        io.to(roomIdStr).emit('newMessage', {
          chatRoomId: roomIdStr,
          senderId: fromUserId.toString(),
          senderName,        // ✅ use from payload, not socket.userName
          senderRole,        // ✅ use from payload, not socket.userRole
          message,
          createdAt: pgMessage.created_at,
        });
            
        console.log(`📤 Emitted newMessage to room ${roomIdStr}`);
      } catch (error) {
        console.error('❌ Error sending message:', error);
      }
    });
    
    
    socket.on('disconnect', () => {
      console.log('🔴 Client disconnected:', socket.id);

      for (const [userId, sId] of Object.entries(userSocketMap)) {
        if (sId === socket.id) {
          delete userSocketMap[userId];
          console.log(`🧹 Removed user ${userId} from socket map`);
          break;
        }
      }
    });
  });
};
