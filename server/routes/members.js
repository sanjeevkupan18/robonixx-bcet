const express = require('express');
const Member = require('../models/Member');
const { protect, adminOnly } = require('../middleware/auth');
const { memberUploader, cloudinary } = require('../config/cloudinary');

const router = express.Router();

// GET /api/members  — public
router.get('/', async (req, res) => {
  try {
    const { batch, isCore, search } = req.query;
    const filter = { active: true };
    if (batch) filter.batch = batch;
    if (isCore === 'true') filter.isCoreTeam = true;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const members = await Member.find(filter).sort({ isCoreTeam: -1, order: 1, name: 1 });
    res.json({ success: true, members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/members/batches  — public
router.get('/batches', async (req, res) => {
  try {
    const batches = await Member.distinct('batch', { active: true });
    res.json({ success: true, batches: batches.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/members/:id  — public
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/members  — admin
router.post('/', protect, adminOnly, memberUploader.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = req.file.path;
      data.imagePublicId = req.file.filename;
    }
    if (data.socialLinks && typeof data.socialLinks === 'string')
      data.socialLinks = JSON.parse(data.socialLinks);
    const member = await Member.create(data);
    res.status(201).json({ success: true, member });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/members/:id  — admin
router.put('/:id', protect, adminOnly, memberUploader.single('image'), async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    const data = { ...req.body };
    if (req.file) {
      if (member.imagePublicId) await cloudinary.uploader.destroy(member.imagePublicId);
      data.image = req.file.path;
      data.imagePublicId = req.file.filename;
    }
    if (data.socialLinks && typeof data.socialLinks === 'string')
      data.socialLinks = JSON.parse(data.socialLinks);
    Object.assign(member, data);
    await member.save();
    res.json({ success: true, member });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/members/:id  — admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    if (member.imagePublicId) await cloudinary.uploader.destroy(member.imagePublicId);
    await member.deleteOne();
    res.json({ success: true, message: 'Member deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
