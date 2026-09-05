const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const generate2FA = (email) => {
  const secret = speakeasy.generateSecret({
    name: `Reda (${email})`,
    length: 32
  });
  return secret;
};

const verify2FA = (token, secret) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2
  });
};

const generateQR = async (secret) => {
  return await QRCode.toDataURL(secret.otpauth_url);
};

module.exports = { generate2FA, verify2FA, generateQR };
