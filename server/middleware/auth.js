const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isSingleAdmin } = require('../utils/adminAccount');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (!(await isSingleAdmin(user))) {
      return res.status(401).json({
        success: false,
        message: 'This admin account is no longer active. Single admin mode is enabled.',
      });
    }
    if ((decoded.sv ?? 0) !== (user.sessionVersion ?? 0)) {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

const adminOnly = (req, res, next) => {
  if (!['admin', 'superadmin'].includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

module.exports = { protect, adminOnly };
