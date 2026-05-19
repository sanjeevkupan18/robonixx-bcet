const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Event = require('../models/Event');
const Member = require('../models/Member');
const { Gallery, ContactMessage } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');
const { validateLogin } = require('../middleware/validators');
const { findSingleAdmin } = require('../utils/adminAccount');

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id, sv: user.sessionVersion ?? 0 }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const user = await findSingleAdmin();
    if (!user || user.email !== normalizedEmail || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    const token = signToken(user);
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/logout-all', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    user.sessionVersion = (user.sessionVersion || 0) + 1;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Signed out from all devices. Please log in again.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const singleAdminDisabled = (req, res) =>
  res.status(410).json({
    success: false,
    message: 'Multiple admin accounts are disabled. This portal now uses a single admin account with multi-device sessions.',
  });

router.get('/users', protect, adminOnly, async (req, res) => {
  return singleAdminDisabled(req, res);
});

router.post('/users', protect, adminOnly, async (req, res) => {
  return singleAdminDisabled(req, res);
});

router.put('/users/:id', protect, adminOnly, async (req, res) => {
  return singleAdminDisabled(req, res);
});

router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  return singleAdminDisabled(req, res);
});

router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalEvents, upcomingEvents, totalMembers, totalGallery, unreadMessages] =
      await Promise.all([
        Event.countDocuments(),
        Event.countDocuments({ status: 'upcoming' }),
        Member.countDocuments({ active: true }),
        Gallery.countDocuments(),
        ContactMessage.countDocuments({ read: false }),
      ]);
    const recentEvents = await Event.find().sort({ createdAt: -1 }).limit(5).select('title date status category');
    const membersByBatch = await Member.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$batch', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, stats: { totalEvents, upcomingEvents, totalMembers, totalGallery, unreadMessages }, recentEvents, membersByBatch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
