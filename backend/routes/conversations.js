const express = require('express');
const Conversation = require('../models/Conversation');

const router = express.Router();

// Get all conversations for user
router.get('/user/:userId', async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.params.userId
    }).populate('participants', 'firstName lastName profilePic status');
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create conversation
router.post('/', async (req, res) => {
  try {
    const { name, isGroup, participants, groupAdmin } = req.body;

    const conversation = new Conversation({
      name,
      isGroup,
      participants,
      groupAdmin
    });

    await conversation.save();
    await conversation.populate('participants', 'firstName lastName profilePic');

    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
