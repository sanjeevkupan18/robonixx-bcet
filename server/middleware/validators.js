const { body, validationResult } = require('express-validator');

// ─── Validation middleware runner ─────────────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Auth validators ──────────────────────────────────────────────────────────
const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  validate,
];

const validateAdminUserCreate = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
];

const validateAdminUserUpdate = [
  body('name').optional().trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .optional({ values: 'falsy' })
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  validate,
];

// ─── Event validators ─────────────────────────────────────────────────────────
const validateEvent = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('shortDescription').trim().notEmpty().withMessage('Short description required').isLength({ max: 300 }),
  body('fullDescription').trim().notEmpty().withMessage('Full description required'),
  body('date').isISO8601().withMessage('Valid date required'),
  body('category').optional().isIn(['workshop', 'bootcamp', 'event', 'seminar', 'competition']),
  validate,
];

// ─── Member validators ────────────────────────────────────────────────────────
const validateMember = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('role').trim().notEmpty().withMessage('Role is required'),
  body('batch').isIn(['2025', '2026', '2027', '2028', '2029', '2030', 'alumni']).withMessage('Valid batch required'),
  validate,
];

// ─── Contact validators ───────────────────────────────────────────────────────
const validateContact = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ min: 10, max: 2000 }),
  validate,
];

module.exports = {
  validateLogin,
  validateAdminUserCreate,
  validateAdminUserUpdate,
  validateEvent,
  validateMember,
  validateContact,
  validate,
};
