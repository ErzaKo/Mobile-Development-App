const express = require('express');
const router = express.Router();
const ChatMessage = require('./chat.model');
const authMiddleware = require('../users/middleware/jwtMiddleware');
const User = require('../users/user.model'); // Sequelize User model

// GET MESSAGES - fetch messages for the logged-in user
router.get('/messages', authMiddleware, async (req, res) => {
  try {
    const { userId, role } = req.user;
    const chatWithId = req.query.chatWithId; // use ?chatWithId=7 for example

    if (role === 'admin') {
      if (!chatWithId) {
        return res.status(400).json({ error: 'Admin must specify a userId to chat with.' });
      }

      query = {
        $or: [
          { senderId: userId, receiverId: parseInt(chatWithId) },
          { senderId: parseInt(chatWithId), receiverId: userId },
        ],
      };
    } else {
      // For normal users, chatting only with admin (assume admin ID is 1 for example)
      const adminId = 1;
      query = {
        $or: [
          { senderId: userId, receiverId: adminId },
          { senderId: adminId, receiverId: userId },
        ],
      };
    }

    const messages = await ChatMessage.find(query).sort({ timestamp: 1 }).limit(100);

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// GET all users the admin has chatted with
router.get('/chat-users', authMiddleware, async (req, res) => {
  try {
    const { userId, role } = req.user;

    if (role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can fetch chat users' });
    }

    const userIds = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            { senderId: userId },
            { receiverId: userId },
          ]
        }
      },
      {
        $project: {
          userId: {
            $cond: [
              { $eq: ['$senderId', userId] },
              '$receiverId',
              '$senderId'
            ]
          }
        }
      },
      {
        $group: {
          _id: '$userId'
        }
      }
    ]);

    // Get user names from PostgreSQL
    const ids = userIds.map(u => u._id);
    const users = await User.findAll({
      where: { id: ids },
      attributes: ['id', 'name']
    });

    res.json(users);
  } catch (err) {
    console.error('Error fetching chat users:', err);
    res.status(500).json({ error: 'Failed to fetch chat user list' });
  }
});

// POST MESSAGE - send new message
router.post('/messages', authMiddleware, async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { receiverId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ error: 'receiverId and message are required.' });
    }

    const newMessage = new ChatMessage({
      senderId,
      receiverId,
      message,
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

module.exports = router;
