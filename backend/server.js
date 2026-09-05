require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reda')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/conversations', require('./routes/conversations'));

app.get('/health', (req, res) => {
  res.json({ status: 'API is running' });
});

// WebRTC Signaling Server
const activeCalls = {};

io.on('connection', (socket) => {
  console.log(`🔗 New user connected: ${socket.id}`);

  socket.on('user_joined', (data) => {
    socket.userId = data.userId;
    socket.broadcast.emit('user_status', { userId: data.userId, status: 'online' });
  });

  // WebRTC Signaling
  socket.on('initiate_call', (data) => {
    const { to, offer } = data;
    activeCalls[socket.userId] = { to, status: 'ringing' };
    io.to(to).emit('incoming_call', {
      from: socket.userId,
      offer: offer
    });
  });

  socket.on('answer_call', (data) => {
    const { to, answer } = data;
    activeCalls[socket.userId] = { to, status: 'connected' };
    io.to(to).emit('call_answered', {
      from: socket.userId,
      answer: answer
    });
  });

  socket.on('ice_candidate', (data) => {
    const { to, candidate } = data;
    io.to(to).emit('ice_candidate', {
      from: socket.userId,
      candidate: candidate
    });
  });

  socket.on('end_call', (data) => {
    const { to } = data;
    delete activeCalls[socket.userId];
    io.to(to).emit('call_ended', { from: socket.userId });
  });

  socket.on('reject_call', (data) => {
    const { to } = data;
    io.to(to).emit('call_rejected', { from: socket.userId });
  });

  // Messages
  socket.on('send_message', (data) => {
    socket.broadcast.emit('receive_message', data);
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('user_typing', data);
  });

  socket.on('message_deleted', (messageId) => {
    socket.broadcast.emit('message_deleted', messageId);
  });

  socket.on('message_read', (data) => {
    socket.broadcast.emit('message_read', data);
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      delete activeCalls[socket.userId];
      socket.broadcast.emit('user_status', { userId: socket.userId, status: 'offline' });
    }
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
