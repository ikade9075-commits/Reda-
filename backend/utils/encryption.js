const crypto = require('crypto');

const encryptMessage = (text, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decryptMessage = (encryptedText, key) => {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let decrypted = decipher.update(parts[1], 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const generateEncryptionKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = { encryptMessage, decryptMessage, generateEncryptionKey };
