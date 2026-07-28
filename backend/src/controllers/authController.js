// backend/src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../config/email');
const {
  createUser, findUserByEmail, sanitizeUser,
  setResetToken, findUserByResetTokenHash, updatePasswordAndClearReset,
} = require('../models/userModel');

const SALT_ROUNDS = 12;

async function register(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password || password.length < 8) {
      return res.status(400).json({ error: 'Email and 8+ character password required' });
    }
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await createUser(email, passwordHash);
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    res.status(201).json({ user: sanitizeUser(user), token });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    res.json({ user: sanitizeUser(user), token });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await findUserByEmail(email);
    req.log.info({ email, userFound: !!user }, 'Forgot password requested'); // temporary debug line

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await setResetToken(email, tokenHash, expiresAt);

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
      await sendPasswordResetEmail(email, resetUrl);
      req.log.info({ email }, 'Password reset email send attempted successfully'); // temporary debug line
    }

    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    req.log.error({ err }, 'Forgot password failed');
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Token and 8+ character password required' });
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await findUserByResetTokenHash(tokenHash);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await updatePasswordAndClearReset(user.id, passwordHash);
    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    req.log.error({ err }, 'Reset password failed');
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

module.exports = { register, login, forgotPassword, resetPassword };