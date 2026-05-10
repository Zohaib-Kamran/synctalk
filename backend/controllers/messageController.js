const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { getIO } = require('../sockets');

const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user?.id;
    const { chatId, content, attachments } = req.body;
    if (!chatId) return res.status(400).json({ message: 'chatId required' });
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (!chat.members.map(String).includes(String(senderId))) return res.status(403).json({ message: 'Not a member of this chat' });

    const msg = await Message.create({ chat: chatId, sender: senderId, content: content || '', attachments: attachments || [] });

    chat.lastMessage = msg._id;
    await chat.save();

    const populated = await Message.findById(msg._id)
      .populate('sender', 'name avatar')
      .populate('deliveredTo', 'name avatar')
      .populate('readBy', 'name avatar');

    const io = getIO();
    if (io) io.to(chatId).emit('message:new', populated);

    res.status(201).json({ message: populated });
  } catch (err) { next(err) }
}

const getMessagesForChat = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (!chat.members.map(String).includes(String(userId))) return res.status(403).json({ message: 'Not a member of this chat' });
    const messages = await Message.find({ chat: chatId }).sort({ createdAt: -1 }).limit(50)
      .populate('sender', 'name avatar')
      .populate('deliveredTo', 'name avatar')
      .populate('readBy', 'name avatar');
    res.json({ messages });
  } catch (err) { next(err) }
}

module.exports = { sendMessage, getMessagesForChat };
