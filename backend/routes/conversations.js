const express = require('express');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

const router = express.Router();

// Get all conversations for user
router.get('/user/:userId', async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.params.userId
    }).populate('participants', 'firstName lastName profilePic status')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
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

// Get conversation by ID
router.get('/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'firstName lastName profilePic')
      .populate('lastMessage');
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add member to group
router.put('/:id/add-member', async (req, res) => {
  try {
    const { userId } = req.body;
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { participants: userId } },
      { new: true }
    ).populate('participants', 'firstName lastName profilePic');
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove member from group
router.put('/:id/remove-member', async (req, res) => {
  try {
    const { userId } = req.body;
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { $pull: { participants: userId } },
      { new: true }
    ).populate('participants', 'firstName lastName profilePic');
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update group info
router.put('/:id', async (req, res) => {
  try {
    const { name, groupPic, description } = req.body;
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { name, groupPic, description, updatedAt: Date.now() },
      { new: true }
    ).populate('participants', 'firstName lastName profilePic');
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
