const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

// Get messages for conversation
router.get('/conversation/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    }).populate('senderId', 'firstName lastName profilePic');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send message
router.post('/', async (req, res) => {
  try {
    const { senderId, conversationId, text, fileUrl, fileType } = req.body;

    const message = new Message({
      senderId,
      conversationId,
      text,
      fileUrl,
      fileType,
      status: 'sent'
    });

    await message.save();
    await message.populate('senderId', 'firstName lastName profilePic');

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
