const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createOneToOne, getMyChats } = require('../controllers/chatController');

router.post('/', auth, createOneToOne);
router.get('/', auth, getMyChats);

module.exports = router;
