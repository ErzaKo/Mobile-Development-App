const express = require('express');
const router = express.Router();
const chatController = require('./chat.controller');


router.post('/rooms/init', chatController.initRoom);  // create or get a chat room
router.get('/rooms', chatController.getAllRooms);     // get all chat rooms (admin)
router.get('/messages', chatController.getMessages);  // get messages by roomId

module.exports = router;