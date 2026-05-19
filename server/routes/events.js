const express = require('express');
const Event = require('../models/Event');
const { protect, adminOnly } = require('../middleware/auth');
const { eventUploader } = require('../config/cloudinary');
const { cloudinary } = require('../config/cloudinary');

const router = express.Router();

const parseJsonField = (value, fallback) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') return value;
  if (value.trim() === '') return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const normalizeJsonField = (data, key, fallback) => {
  if (!(key in data)) return;
  data[key] = parseJsonField(data[key], fallback);
};

// GET /api/events  — public
router.get('/', async (req, res) => {
  try {
    const { status, category, page = 1, limit = 12, featured } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;

    const skip = (Number(page) - 1) * Number(limit);
    const [events, total] = await Promise.all([
      Event.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Event.countDocuments(filter),
    ]);

    res.json({ success: true, events, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/events/:idOrSlug  — public
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const event = await Event.findOne(
      idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? { _id: idOrSlug } : { slug: idOrSlug }
    );
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/events  — admin
router.post('/', protect, adminOnly, eventUploader.single('image'), async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };
    if (req.file) {
      data.image = req.file.path;
      data.imagePublicId = req.file.filename;
    }
    normalizeJsonField(data, 'schedule', []);
    normalizeJsonField(data, 'tags', []);
    normalizeJsonField(data, 'gallery', []);
    const event = await Event.create(data);
    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/events/:id  — admin
router.put('/:id', protect, adminOnly, eventUploader.single('image'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const data = { ...req.body };
    if (req.file) {
      // Delete old image
      if (event.imagePublicId) await cloudinary.uploader.destroy(event.imagePublicId);
      data.image = req.file.path;
      data.imagePublicId = req.file.filename;
    }
    normalizeJsonField(data, 'schedule', []);
    normalizeJsonField(data, 'tags', []);
    normalizeJsonField(data, 'gallery', []);

    Object.assign(event, data);
    await event.save();
    res.json({ success: true, event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/events/:id  — admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.imagePublicId) await cloudinary.uploader.destroy(event.imagePublicId);
    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
