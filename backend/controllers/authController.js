const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed });
    const access = generateAccessToken({ id: user._id });
    const refresh = generateRefreshToken({ id: user._id });
    res.cookie('jid', refresh, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email }, accessToken: access });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const access = generateAccessToken({ id: user._id });
    const refresh = generateRefreshToken({ id: user._id });
    res.cookie('jid', refresh, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.json({ user: { id: user._id, name: user.name, email: user.email }, accessToken: access });
  } catch (err) { next(err); }
};

const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.jid;
    if (!token) return res.status(401).json({ message: 'No refresh token' });
    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });
    const access = generateAccessToken({ id: user._id });
    const refresh = generateRefreshToken({ id: user._id });
    res.cookie('jid', refresh, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.json({ accessToken: access });
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie('jid', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    res.json({ ok: true });
  } catch (err) { next(err); }
};

module.exports = { register, login, refreshToken, logout };
