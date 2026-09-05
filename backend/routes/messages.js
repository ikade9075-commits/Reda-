const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { encryptMessage, decryptMessage } = require('../utils/encryption');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 52428800 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp3|mp4|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

router.get('/conversation/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    }).populate('senderId', 'firstName lastName profilePic').sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { senderId, conversationId, text, fileUrl, fileType, encrypted, encryptionKey, expiresIn } = req.body;

    let encryptedText = text;
    if (encrypted && encryptionKey) {
      encryptedText = encryptMessage(text, encryptionKey);
    }

    const messageData = {
      senderId,
      conversationId,
      text: encrypted ? '[Encrypted Message]' : text,
      encryptedText: encrypted ? encryptedText : undefined,
      fileUrl,
      fileType,
      status: 'sent',
      encrypted
    };

    if (expiresIn && expiresIn > 0) {
      messageData.expiresAt = new Date(Date.now() + expiresIn * 1000);
    }

    const message = new Message(messageData);
    await message.save();
    await message.populate('senderId', 'firstName lastName profilePic');

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: Date.now()
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const fileType = req.file.mimetype.split('/')[0];

    res.json({
      fileUrl,
      fileType,
      fileName: req.file.originalname
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:messageId', async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { text: 'تم حذف الرسالة', fileUrl: null, deleted: true },
      { new: true }
    );
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:messageId', async (req, res) => {
  try {
    const { text } = req.body;
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { text, edited: true, editedAt: Date.now() },
      { new: true }
    ).populate('senderId', 'firstName lastName profilePic');
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:messageId/read', async (req, res) => {
  try {
    const { userId } = req.body;
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      {
        status: 'read',
        $addToSet: { readBy: { userId, readAt: Date.now() } }
      },
      { new: true }
    );
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/backup/download', async (req, res) => {
  try {
    const messages = await Message.find({}).populate('senderId conversationId');
    res.json({
      backup: messages,
      date: new Date(),
      version: '1.0.0'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
