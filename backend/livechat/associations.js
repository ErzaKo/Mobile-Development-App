const ChatRoom = require('./chat_rooms.model');
const ChatRoomParticipant = require('./chat_room_participants');
const ChatMessage = require('./chat_messages.model');
const User = require('../users/user.model'); // if needed for User associations

// One ChatRoom has many ChatRoomParticipants
ChatRoom.hasMany(ChatRoomParticipant, { foreignKey: 'room_id' });
ChatRoomParticipant.belongsTo(ChatRoom, { foreignKey: 'room_id' });

// One ChatRoom has many ChatMessages
ChatRoom.hasMany(ChatMessage, { foreignKey: 'room_id' });
ChatMessage.belongsTo(ChatRoom, { foreignKey: 'room_id' });

// One User can send many ChatMessages
User.hasMany(ChatMessage, { foreignKey: 'sender_id' });
ChatMessage.belongsTo(User, { foreignKey: 'sender_id' });

// One User can be participant in many ChatRooms
User.hasMany(ChatRoomParticipant, { foreignKey: 'user_id' });
ChatRoomParticipant.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  ChatRoom,
  ChatRoomParticipant,
  ChatMessage,
  User,
};
