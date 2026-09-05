const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  name: String,
  isGroup: {
    type: Boolean,
    default: false
  },
  groupAdmin: mongoose.Schema.Types.ObjectId,
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  groupPic: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Conversation', conversationSchema);
