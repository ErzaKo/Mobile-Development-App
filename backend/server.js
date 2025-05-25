const express = require("express");
const http = require("http"); 
const socketIo = require("socket.io");  
const app = express();
require('dotenv').config(); 
require('./config/db.js');
const connectMongo = require('./config/mongo.js');
const cors = require('cors');
connectMongo();
const path = require('path');
const multer = require("multer");

const userRoutes = require('./users/user.routes.js');
const eventRoutes = require('./events/event.routes');
const questionRoutes = require('./questions/routes/question.routes');
const chatRoutes = require('./livechat/chat.routes.js');
const categoryRoutes = require("./categories/category.routes");

const PORT = process.env.PORT || 5001;

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const server = http.createServer(app); 
const io = socketIo(server, { cors: corsOptions }); 

const handleChatSocket = require('./livechat/chat.socket.js'); 
handleChatSocket(io);  // Pass io to your chat socket handler

app.use(cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 

app.get("/", (req, res) => {
  res.send("API is running...");
}); 

app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/questions', questionRoutes);
app.use("/api/categories", categoryRoutes);
app.use('/api/livechat', chatRoutes);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});