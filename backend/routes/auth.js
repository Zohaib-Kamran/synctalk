const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../validators/authValidator');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

module.exports = router;
