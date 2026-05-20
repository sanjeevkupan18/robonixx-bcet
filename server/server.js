const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { MAX_IMAGE_SIZE_MB } = require('./config/cloudinary');
const authRoutes    = require('./routes/auth');
const eventRoutes   = require('./routes/events');
const memberRoutes  = require('./routes/members');
const galleryRoutes = require('./routes/gallery');
const contactRoutes = require('./routes/contact');
const contentRoutes = require('./routes/content');

const app = express();
app.set('trust proxy', 1);

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

const originMatchesPattern = (origin, pattern) => {
  if (!pattern.includes('*')) return false;

  try {
    const originUrl = new URL(origin);
    const patternUrl = new URL(pattern.replace('*.', 'placeholder.'));

    if (originUrl.protocol !== patternUrl.protocol) return false;

    const expectedSuffix = patternUrl.hostname.replace('placeholder.', '.');
    return originUrl.hostname.endsWith(expectedSuffix);
  } catch {
    return false;
  }
};

const isAllowedOrigin = (origin) =>
  allowedOrigins.some((allowedOrigin) =>
    allowedOrigin === origin || originMatchesPattern(origin, allowedOrigin)
  );

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || isAllowedOrigin(origin)) return cb(null, true);
    console.error(`[CORS] Rejected origin: ${origin}`);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
}));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logger ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/events',  eventRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/content', contentRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Robonixx API is live 🤖', timestamp: new Date() });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);

  if (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: `Upload exceeds the ${MAX_IMAGE_SIZE_MB}MB file size limit. Please choose a smaller file.`,
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── DB Connect + Seed + Start ────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedAdmin();
    await seedDefaultContent();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// ─── Seed: Admin User ─────────────────────────────────────────────────────────
async function seedAdmin() {
  try {
    const User = require('./models/User');
    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL_SEED });
    if (!existing && process.env.ADMIN_EMAIL_SEED && process.env.ADMIN_PASSWORD_SEED) {
      await User.create({
        name: process.env.ADMIN_NAME || 'Admin',
        email: process.env.ADMIN_EMAIL_SEED,
        password: process.env.ADMIN_PASSWORD_SEED, // hashed by pre-save hook
        role: 'admin',
      });
      console.log('🔐 Admin user seeded');
    }
  } catch (err) {
    console.error('Seed admin error:', err.message);
  }
}

// ─── Seed: Default Site Content ───────────────────────────────────────────────
async function seedDefaultContent() {
  try {
    const SiteContent = require('./models/SiteContent');
    const existing = await SiteContent.findOne({ key: 'site_settings' });
    if (!existing) {
      await SiteContent.create({
        key: 'site_settings',
        data: {
          tagline: 'Where Innovation Meets Intelligence',
          motto: 'Build. Learn. Innovate.',
          about: 'Robonixx is a premier IoT & Robotics club that empowers students to explore, create, and lead in the world of intelligent machines and connected systems.',
          foundationYear: 2019,
          hodName: 'Dr. Priya Sharma',
          hodDesignation: 'Head of Department, Electronics & Communication',
          hodImage: '',
          facultyMembers: [
            {
              name: 'Dr. Priya Sharma',
              designation: 'Head of Department, Electronics & Communication',
              description: 'Guiding Robonixx with wisdom and vision, enabling students to achieve excellence in technology and innovation.',
              image: '',
            },
            {
              name: 'Faculty Coordinator',
              designation: 'Robonixx Faculty Coordinator',
              description: 'Supports club operations, event planning, and student coordination throughout the academic year.',
              image: '',
            },
            {
              name: 'Technical Mentor',
              designation: 'Project and Workshop Mentor',
              description: 'Guides members during build sessions, bootcamps, and interdisciplinary project development.',
              image: '',
            },
          ],
          currentLeaders: [
            { name: 'Leader 01', branch: 'ECE', position: 'President', image: '' },
            { name: 'Leader 02', branch: 'CSE', position: 'Vice President', image: '' },
            { name: 'Leader 03', branch: 'EEE', position: 'Technical Lead', image: '' },
            { name: 'Leader 04', branch: 'ECE', position: 'Secretary', image: '' },
            { name: 'Leader 05', branch: 'ME', position: 'Event Head', image: '' },
            { name: 'Leader 06', branch: 'CSE', position: 'Media Head', image: '' },
            { name: 'Leader 07', branch: 'ECE', position: 'Operations Lead', image: '' },
          ],
          socialLinks: {
            instagram: 'https://instagram.com/robonixx',
            linkedin: 'https://linkedin.com/company/robonixx',
            github: 'https://github.com/robonixx',
          },
          contactAddress: 'Room 302, Tech Block, College Campus, India',
          contactEmail: 'robonixx@college.edu',
          contactPhone: '+91 98765 43210',
        },
      });
      console.log('📝 Default site content seeded');
    }
  } catch (err) {
    console.error('Seed content error:', err.message);
  }
}

module.exports = app;
