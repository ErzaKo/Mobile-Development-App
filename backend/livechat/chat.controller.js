const ChatRoom = require('./chat_rooms.model');
const ChatRoomParticipant = require('./chat_room_participants'); // added .model
const ChatMessage = require('./chat_messages.model');
const ChatMessageMongo = require('./chatMessage.mongo');
const { Op, Sequelize } = require('sequelize');
const User = require('../users/user.model');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

async function findOrCreateRoomForUsers(userId1, userId2) {
  const sorted = [userId1, userId2].sort((a, b) => a - b); // Ensure consistent order

  try {
    // Step 1: Try to find a room that contains both users
    const rooms = await ChatRoom.findAll({
      include: {
        model: ChatRoomParticipant,
        where: {
          user_id: { [Op.in]: sorted },
        },
        required: true,
      },
    });

    // Step 2: Filter to find a room that has exactly those 2 users
    for (const room of rooms) {
      const participantIds = room.ChatRoomParticipants.map(p => p.user_id).sort((a, b) => a - b);
      if (
        participantIds.length === 2 &&
        participantIds[0] === sorted[0] &&
        participantIds[1] === sorted[1]
      ) {
        console.log(`[ROOM FOUND] Existing room between ${userId1} and ${userId2}: ${room.id}`);
        return room;
      }
    }

    // Step 3: Create new room if none exists
    const newRoom = await ChatRoom.create();
    await ChatRoomParticipant.bulkCreate([
      { room_id: newRoom.id, user_id: userId1 },
      { room_id: newRoom.id, user_id: userId2 },
    ]);

    console.log(`[ROOM CREATED] New room between ${userId1} and ${userId2}: ${newRoom.id}`);
    return newRoom;

  } catch (error) {
    console.error('Error in findOrCreateRoomForUsers:', error);
    throw error;
  }
}

exports.findOrCreateRoomForUsers = findOrCreateRoomForUsers;  

// Create or get existing chat room between two users
exports.initRoom = async (req, res) => {
  console.log("Received request to create room for users:", req.body);
  let { userId1, userId2 } = req.body;

  if (!userId1) {
    return res.status(400).json({ error: "Missing userId1 in request body" });
  }

  try {
    const user1 = await User.findByPk(userId1);
    if (!user1) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user1.role === 'user') {
      const admin = await User.findOne({ where: { role: 'admin' } });
      if (!admin) {
        return res.status(500).json({ error: "No admin user found" });
      }
      userId2 = admin.id;
    } else if (user1.role === 'admin') {
      if (!userId2) {
        return res.status(400).json({ error: "Admin must provide userId2 (target user)" });
      }
    }

    if (userId1 === userId2) {
      return res.status(400).json({ error: "Cannot create room with yourself" });
    }

    console.log("Inside socket, userId1:", userId1, "userId2:", userId2);

    const room = await findOrCreateRoomForUsers(userId1, userId2);

    // ✅ EMIT SOCKET EVENT HERE (admin listens to this)
    const io = req.app.get('io');  // Make sure you set io in your app.js/server.js
    if (io) {
      io.emit('newRoomCreated', room);  // Emit the room to all clients
    }

    return res.status(200).json({ chatRoomId: room.id });

  } catch (err) {
    console.error('initRoom error:', err);
    return res.status(500).json({ error: 'Failed to initialize chat room' });
  }
};


// Get all chat rooms (for admin, with participant info)
exports.getAllRooms = async (req, res) => {
  try {
    console.log('🟡 getAllRooms called');

    const rooms = await ChatRoom.findAll({
      include: [
        {
          model: ChatRoomParticipant,
          include: {
            model: User,
            attributes: ['id', 'name', 'role'],
          },
        },
      ],
    });

    const seen = new Set();
    const formattedRooms = [];

    for (const room of rooms) {
      const userParticipant = room.ChatRoomParticipants.find(p => p.User && p.User.role === 'user');
      if (!userParticipant || seen.has(userParticipant.User.id)) continue;

      seen.add(userParticipant.User.id);
      formattedRooms.push({
        id: room.id,
        participantName: userParticipant.User.name,
        participantId: userParticipant.User.id,
      });
    }

    console.log('🟢 Unique formatted rooms:', formattedRooms);
    res.status(200).json(formattedRooms);
  } catch (err) {
    console.error('🔴 getAllRooms error:', err.message);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

// Get messages by roomId
// Get messages by roomId
exports.getMessages = async (req, res) => {
  const { roomId } = req.query;

  if (!roomId || isNaN(roomId)) {
    return res.status(400).json({ error: 'Missing or invalid roomId' });
  }

  try {
    const sqlMessages = await ChatMessage.findAll({
      where: { room_id: Number(roomId) },
      order: [['created_at', 'ASC']],
    });

    const fullMessages = await Promise.all(sqlMessages.map(async (sqlMsg) => {
      let mongoMsg = null;
      if (sqlMsg.mongo_message_id) {
        try {
          mongoMsg = await ChatMessageMongo.findById(sqlMsg.mongo_message_id);
        } catch (e) {
          console.warn(`⚠️ Error loading Mongo message ${sqlMsg.mongo_message_id}`);
        }
      }

      // ✅ Load sender details
      const sender = await User.findByPk(sqlMsg.sender_id);

      return {
        id: sqlMsg.id,
        chatRoomId: sqlMsg.room_id.toString(),
        senderId: sqlMsg.sender_id.toString(),
        senderName: sender?.name || 'User',
        senderRole: sender?.role || 'user',
        message: mongoMsg?.message || '[Missing message]',
        createdAt: sqlMsg.created_at,
      };
    }));

    res.status(200).json(fullMessages);
  } catch (err) {
    console.error('❌ Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
