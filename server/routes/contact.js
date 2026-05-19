const express = require('express');
const nodemailer = require('nodemailer');
const ContactMessage = require('../models/ContactMessage');
const { protect, adminOnly } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const { contactNotificationTemplate, contactAutoReplyTemplate } = require('../utils/emailTemplates');

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many messages sent. Please try again in an hour.' },
});

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

// POST /api/contact — public
router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, email, subject = 'General Inquiry', message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });

    await ContactMessage.create({ name, email, subject, message, ipAddress: req.ip });

    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.ADMIN_EMAIL,
        subject: `[Robonixx Contact] ${subject} — from ${name}`,
        html: contactNotificationTemplate({ name, email, subject, message }),
      });
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Thanks for contacting Robonixx, ${name}!`,
        html: contactAutoReplyTemplate({ name, message }),
      });
    } catch (emailErr) {
      console.error('Email send error:', emailErr.message);
    }

    res.status(201).json({ success: true, message: 'Message sent! We will respond soon.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/contact — admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { read, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (read === 'true') filter.read = true;
    if (read === 'false') filter.read = false;
    const skip = (Number(page) - 1) * Number(limit);
    const [messages, total] = await Promise.all([
      ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      ContactMessage.countDocuments(filter),
    ]);
    res.json({ success: true, messages, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/contact/:id/read — admin
router.put('/:id/read', protect, adminOnly, async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/contact/:id — admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
