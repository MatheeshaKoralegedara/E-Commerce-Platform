// backend/src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../config/email');
const {
  createUser, findUserByEmail, sanitizeUser,
  setResetToken, findUserByResetTokenHash, updatePasswordAndClearReset,
} = require('../models/userModel');
const { mergeGuestCartIntoUserCart } = require('../models/cartModel');

const SALT_ROUNDS = 12;

function isPasswordStrong(password) {
  if (password.length < 8) return { valid: false, error: 'Password must be at least 8 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, error: 'Password must contain at least one uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, error: 'Password must contain at least one lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, error: 'Password must contain at least one number' };
  return { valid: true };
}

async function register(req, res) {
  try {
    const { email, password, fullName, phone, addressLine1, city, postalCode, country } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const passwordCheck = isPasswordStrong(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.error });
    }
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await createUser({ email, passwordHash, fullName, phone, addressLine1, city, postalCode, country });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ user: sanitizeUser(user), token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { email, password, guestToken } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (guestToken) {
      await mergeGuestCartIntoUserCart(guestToken, user.id);
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    res.json({ user: sanitizeUser(user), token });
  } catch (err) {
    console.error(err);
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
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and password required' });
    }
    const passwordCheck = isPasswordStrong(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.error });
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

async function updateProfile(req, res) {
  try {
    const { fullName, phone, addressLine1, city, postalCode, country } = req.body;
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    const user = await updateUserProfile(req.user.userId, { fullName, phone, addressLine1, city, postalCode, country });
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    req.log.error({ err }, 'Failed to update profile');
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

module.exports = { register, login, forgotPassword, resetPassword, updateProfile };