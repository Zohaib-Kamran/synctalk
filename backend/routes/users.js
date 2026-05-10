const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMe } = require('../controllers/userController');
const { searchUsers } = require('../controllers/usersController');

router.get('/me', auth, getMe);
router.get('/search', auth, searchUsers);

module.exports = router;
