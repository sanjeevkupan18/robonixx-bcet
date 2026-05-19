const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    batch: {
      type: String,
      required: true,
      enum: ['2025', '2026', '2027', '2028', '2029', '2030', 'alumni'],
    },
    department: { type: String, default: '' },
    image: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    shortBio: { type: String, maxlength: 200, default: '' },
    socialLinks: {
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      instagram: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },
    isCore: { type: Boolean, default: false },
    isCoreTeam: { type: Boolean, default: false },
    coreRole: {
      type: String,
      enum: ['president', 'vice-president', 'tech-lead', 'secretary', 'treasurer', 'media-head', 'event-head', 'member', ''],
      default: '',
    },
    order: { type: Number, default: 99 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

memberSchema.index({ batch: 1, order: 1, isCoreTeam: -1 });

module.exports = mongoose.model('Member', memberSchema);
