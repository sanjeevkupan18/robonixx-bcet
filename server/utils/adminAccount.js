const User = require('../models/User');

const getConfiguredAdminEmail = () =>
  (process.env.ADMIN_EMAIL || process.env.ADMIN_EMAIL_SEED || '').trim().toLowerCase() || null;

const findSingleAdmin = async () => {
  const configuredEmail = getConfiguredAdminEmail();

  if (configuredEmail) {
    const configuredAdmin = await User.findOne({ email: configuredEmail });
    if (configuredAdmin) return configuredAdmin;
  }

  return User.findOne({ role: { $in: ['admin', 'superadmin'] } }).sort({ createdAt: 1 });
};

const isSingleAdmin = async (user) => {
  if (!user) return false;

  const singleAdmin = await findSingleAdmin();
  return !!singleAdmin && String(singleAdmin._id) === String(user._id || user);
};

module.exports = { getConfiguredAdminEmail, findSingleAdmin, isSingleAdmin };
