const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sendMessage, getMessagesForChat } = require('../controllers/messageController');

router.post('/', auth, sendMessage);
router.get('/:chatId', auth, getMessagesForChat);

module.exports = router;
