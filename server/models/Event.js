const mongoose = require('mongoose');

const scheduleItemSchema = new mongoose.Schema({
  time: { type: String, required: true },
  activity: { type: String, required: true },
  speaker: { type: String, default: '' },
});

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    shortDescription: { type: String, required: true, maxlength: 300 },
    fullDescription: { type: String, required: true },
    date: { type: Date, required: true },
    endDate: { type: Date },
    venue: { type: String, default: '' },
    category: { type: String, enum: ['workshop', 'bootcamp', 'event', 'seminar', 'competition'], default: 'event' },
    status: { type: String, enum: ['upcoming', 'ongoing', 'past'], default: 'upcoming' },
    image: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    gallery: [{ url: String, publicId: String }],
    schedule: [scheduleItemSchema],
    registrationLink: { type: String, default: '' },
    registrationDeadline: { type: Date },
    maxParticipants: { type: Number, default: 0 },
    tags: [{ type: String }],
    featured: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto-generate slug from title
eventSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now();
  }
  // Auto-update status based on date
  const now = new Date();
  if (this.date > now) this.status = 'upcoming';
  else if (this.endDate && this.endDate > now) this.status = 'ongoing';
  else this.status = 'past';
  next();
});

eventSchema.index({ date: -1, status: 1, featured: -1 });

module.exports = mongoose.model('Event', eventSchema);
