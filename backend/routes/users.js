const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { firstName: new RegExp(req.params.query, 'i') },
        { lastName: new RegExp(req.params.query, 'i') },
        { email: new RegExp(req.params.query, 'i') }
      ]
    }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
