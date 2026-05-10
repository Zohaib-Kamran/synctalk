const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Unauthorized' });
  const parts = auth.split(' ');
  if (parts[0] !== 'Bearer' || !parts[1]) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = jwt.verify(parts[1], process.env.ACCESS_TOKEN_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = authMiddleware;
