const ChatMessage = require('./chat.model'); // mongoose model with senderId, receiverId, message, timestamp
const jwt = require('jsonwebtoken');
const User = require('../users/user.model'); // Sequelize User model for PostgreSQL

const userSockets = new Map();    // userId (Number) -> socket.id
const adminSockets = new Set();   // Set of admin socket IDs
const activeUsers = new Set();    // Store userIds of users who've sent messages

module.exports = function (io) {
  // Middleware to verify token
  io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (!token) return next(new Error('Authentication error: No token'));

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error: Invalid token'));

      socket.user = decoded; // { userId, name, role }
      next();
    });
  });

  // Utility to send updated user list with names to admins
  async function sendUpdatedUserListToAdmins() {
    try {
      const userIds = Array.from(activeUsers);
      // Fetch users from PostgreSQL by IDs
      const users = await User.findAll({
        where: { id: userIds },
        attributes: ['id', 'name'],
      });

      // Map userId -> name
      const userList = users.map(u => ({ id: u.id, name: u.name }));

      // Send updated list to all connected admins
      adminSockets.forEach(adminSocketId => {
        io.to(adminSocketId).emit('userList', userList);
      });
    } catch (err) {
      console.error('Error sending updated user list:', err);
    }
  }

  io.on('connection', async (socket) => {
    const { userId, name, role } = socket.user;
    console.log(`✅ ${role} connected: ${name} (${userId})`);

    if (role === 'admin') {
      adminSockets.add(socket.id);
      console.log('🧑‍💼 Admin connected:', socket.id);

      // On admin connection, send current active users with their latest names
      await sendUpdatedUserListToAdmins();
    } else {
      userSockets.set(userId, socket.id);
      console.log(`👤 User ${name} (ID: ${userId}) socket set:`, socket.id);
    }

    // Handle message send
    socket.on('chatMessage', async (msg) => {
      /*
       msg = {
         senderId: Number,
         receiverId: Number,
         message: String
       }
      */
      const { senderId, receiverId, message } = msg;

      // Save to MongoDB with proper schema keys
      try {
        const newMessage = new ChatMessage({
          senderId,
          receiverId,
          message,
        });
        await newMessage.save();
        console.log('✅ Message saved to MongoDB:', newMessage);

        // Track active user for updating user list
        if (role !== 'admin') {
          activeUsers.add(senderId);
          await sendUpdatedUserListToAdmins();
        }

        // Emit the message to the correct recipient(s)
        if (role === 'admin') {
          // Admin sending message to a user
          const targetSocketId = userSockets.get(receiverId);
          if (targetSocketId) {
            io.to(targetSocketId).emit('chatMessage', newMessage);
            console.log(`➡️ Admin sent message to user ID ${receiverId}`);
          } else {
            console.warn(`⚠️ User ID ${receiverId} not connected`);
          }
        } else {
          // User sending message to admin(s)
          // Notify all connected admins
          adminSockets.forEach(adminSocketId => {
            io.to(adminSocketId).emit('chatMessage', newMessage);
          });
        }
      } catch (err) {
        console.error('❌ Error saving message:', err.message);
      }
    });

    // Allow admin to request updated user list manually
    socket.on('getUserList', async () => {
      if (role === 'admin') {
        await sendUpdatedUserListToAdmins();
      }
    });

    // Cleanup on disconnect
    socket.on('disconnect', () => {
      if (role === 'admin') {
        adminSockets.delete(socket.id);
        console.log('❌ Admin disconnected:', socket.id);
      } else {
        userSockets.delete(userId);
        console.log(`❌ User ${name} (ID: ${userId}) disconnected`);
      }
    });
  });
};
