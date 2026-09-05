const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  text: String,
  encryptedText: String,
  fileUrl: String,
  fileType: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'text']
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  readBy: [{
    userId: mongoose.Schema.Types.ObjectId,
    readAt: Date
  }],
  deleted: {
    type: Boolean,
    default: false
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  replyTo: mongoose.Schema.Types.ObjectId,
  expiresAt: Date,
  encrypted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-delete expired messages
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Message', messageSchema);
