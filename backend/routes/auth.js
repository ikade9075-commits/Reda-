const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generate2FA, verify2FA, generateQR } = require('../utils/twofa');
const { generateEncryptionKey } = require('../utils/encryption');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { phone, email, password, firstName, lastName } = req.body;

    if (!password) return res.status(400).json({ error: 'Password required' });
    if (!phone && !email) return res.status(400).json({ error: 'Phone or Email required' });

    const existingUser = await User.findOne({
      $or: [{ phone }, { email }]
    });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = new User({
      phone,
      email,
      password,
      firstName,
      lastName,
      encryptionKey: generateEncryptionKey()
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, email, password } = req.body;

    const user = await User.findOne({
      $or: [{ phone }, { email }]
    });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login successful',
      requiresTwoFA: user.twoFactorEnabled,
      token,
      user: {
        id: user._id,
        phone: user.phone,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/2fa/setup', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const secret = generate2FA(user.email);
    const qrCode = await generateQR(secret);

    res.json({
      secret: secret.base32,
      qrCode: qrCode
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/2fa/verify', async (req, res) => {
  try {
    const { userId, token, secret } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isValid = verify2FA(token, secret);
    if (!isValid) return res.status(401).json({ error: 'Invalid 2FA token' });

    user.twoFactorSecret = secret;
    user.twoFactorEnabled = true;
    await user.save();

    res.json({ message: '2FA enabled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/2fa/verify-login', async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isValid = verify2FA(token, user.twoFactorSecret);
    if (!isValid) return res.status(401).json({ error: 'Invalid 2FA token' });

    const jwtToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({ token: jwtToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
