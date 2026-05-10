const User = require('../models/User');

// Search users by name or email (protected)
const searchUsers = async (req, res, next) => {
  try {
    const q = (req.query.query || '').trim();
    if (!q) return res.json({ users: [] });
    const regex = new RegExp(q.split(' ').join('|'), 'i');
    const users = await User.find({ $or: [{ name: regex }, { email: regex }] }).select('name email avatar bio').limit(20).lean();
    res.json({ users });
  } catch (err) { next(err) }
}

module.exports = { searchUsers };
