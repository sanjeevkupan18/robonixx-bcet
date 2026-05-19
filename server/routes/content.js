const express = require('express');
const SiteContent = require('../models/SiteContent');
const { protect, adminOnly } = require('../middleware/auth');
const { contentUploader } = require('../config/cloudinary');

const router = express.Router();

// GET /api/content/:key  — public
router.get('/:key', async (req, res) => {
  try {
    const content = await SiteContent.findOne({ key: req.params.key });
    if (!content) return res.status(404).json({ success: false, message: 'Content not found' });
    res.json({ success: true, content: content.data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/content/:key  — admin
router.put('/:key', protect, adminOnly, async (req, res) => {
  try {
    const content = await SiteContent.findOneAndUpdate(
      { key: req.params.key },
      { data: req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, content: content.data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/content/upload/image  — admin (for HOD image, etc.)
router.post('/upload/image', protect, adminOnly, contentUploader.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
    res.json({ success: true, url: req.file.path, publicId: req.file.filename });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
