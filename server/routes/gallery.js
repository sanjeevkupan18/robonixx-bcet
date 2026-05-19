const express = require('express');
const Gallery = require('../models/Gallery');
const { protect, adminOnly } = require('../middleware/auth');
const { galleryUploader, cloudinary } = require('../config/cloudinary');

const router = express.Router();

// GET /api/gallery — public
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    const skip = (Number(page) - 1) * Number(limit);
    const [images, total] = await Promise.all([
      Gallery.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Gallery.countDocuments(filter),
    ]);
    res.json({ success: true, images, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/gallery — admin (multi-upload)
router.post('/', protect, adminOnly, galleryUploader.array('images', 20), async (req, res) => {
  try {
    if (!req.files?.length)
      return res.status(400).json({ success: false, message: 'No media uploaded' });
    const { category = 'other', caption = '' } = req.body;
    const docs = req.files.map((f) => ({
      url: f.path,
      publicId: f.filename,
      mediaType: f.mimetype?.startsWith('video/') ? 'video' : 'image',
      category,
      caption,
      uploadedBy: req.user._id,
    }));
    const images = await Gallery.insertMany(docs);
    res.status(201).json({ success: true, images });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/gallery/:id — admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const image = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
    res.json({ success: true, image });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/gallery/:id — admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
    try {
      await cloudinary.uploader.destroy(image.publicId, {
        resource_type: image.mediaType === 'video' ? 'video' : 'image',
      });
    } catch (e) { console.warn('Cloudinary delete failed:', e.message); }
    await image.deleteOne();
    res.json({ success: true, message: 'Media deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
