const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password -encryptionKey -twoFactorSecret');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -encryptionKey -twoFactorSecret');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { firstName, lastName, bio, profilePic, messageExpiry } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, bio, profilePic, messageExpiry },
      { new: true }
    ).select('-password -encryptionKey -twoFactorSecret');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/search/:query', async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { firstName: new RegExp(req.params.query, 'i') },
        { lastName: new RegExp(req.params.query, 'i') },
        { email: new RegExp(req.params.query, 'i') },
        { phone: new RegExp(req.params.query, 'i') }
      ]
    }).select('-password -encryptionKey -twoFactorSecret');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status, lastSeen: Date.now() },
      { new: true }
    ).select('-password -encryptionKey -twoFactorSecret');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/backup', async (req, res) => {
  try {
    const Message = require('../models/Message');
    const Conversation = require('../models/Conversation');
    
    const conversations = await Conversation.find({ participants: req.params.id });
    const conversationIds = conversations.map(c => c._id);
    const messages = await Message.find({ conversationId: { $in: conversationIds } });

    const backup = {
      user: await User.findById(req.params.id).select('-password -encryptionKey -twoFactorSecret'),
      conversations,
      messages,
      exportedAt: new Date()
    };

    res.json(backup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
