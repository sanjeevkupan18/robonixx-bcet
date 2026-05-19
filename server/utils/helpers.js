/**
 * Robonixx — Backend Utility Helpers
 */

// ─── Slugify a string ─────────────────────────────────────────────────────────
const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

// ─── Async handler wrapper ────────────────────────────────────────────────────
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ─── Pagination helper ────────────────────────────────────────────────────────
const getPagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// ─── Build sort object ────────────────────────────────────────────────────────
const buildSort = (sortBy = 'createdAt', order = 'desc') => ({
  [sortBy]: order === 'asc' ? 1 : -1,
});

// ─── Strip undefined from object ─────────────────────────────────────────────
const compact = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== '' && v !== null));

// ─── Format success response ──────────────────────────────────────────────────
const success = (res, data = {}, statusCode = 200, message = 'Success') =>
  res.status(statusCode).json({ success: true, message, ...data });

// ─── Format error response ────────────────────────────────────────────────────
const failure = (res, message = 'Internal Server Error', statusCode = 500) =>
  res.status(statusCode).json({ success: false, message });

// ─── Parse comma-separated tags ───────────────────────────────────────────────
const parseTags = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return raw.split(',').map(t => t.trim()).filter(Boolean); }
};

// ─── Safely parse JSON field ──────────────────────────────────────────────────
const safeParseJSON = (raw, fallback = null) => {
  if (!raw) return fallback;
  if (typeof raw !== 'string') return raw;
  try { return JSON.parse(raw); } catch { return fallback; }
};

module.exports = { slugify, asyncHandler, getPagination, buildSort, compact, success, failure, parseTags, safeParseJSON };
