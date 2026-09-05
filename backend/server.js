const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reda')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/conversations', require('./routes/conversations'));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'API is running' });
});

// Socket.io Events
io.on('connection', (socket) => {
  console.log(`🔗 New user connected: ${socket.id}`);

  // User joined
  socket.on('user_joined', (data) => {
    console.log(`👤 User joined: ${data.userId}`);
    socket.broadcast.emit('user_status', { userId: data.userId, status: 'online' });
  });

  // Send message
  socket.on('send_message', (data) => {
    console.log(`📨 Message from ${data.senderId}: ${data.text}`);
    socket.broadcast.emit('receive_message', data);
  });

  // User typing
  socket.on('typing', (data) => {
    socket.broadcast.emit('user_typing', data);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    socket.broadcast.emit('user_status', { status: 'offline' });
  });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
