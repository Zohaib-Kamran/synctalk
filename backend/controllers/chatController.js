const Chat = require('../models/Chat');
const User = require('../models/User');

// Create or return existing one-to-one chat
const createOneToOne = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { memberId } = req.body;
    if (!memberId) return res.status(400).json({ message: 'memberId required' });
    if (memberId === userId) return res.status(400).json({ message: 'Cannot create chat with yourself' });

    const members = [userId, memberId];
    let chat = await Chat.findOne({ isGroup: false, members: { $all: members, $size: 2 } }).populate('members', '-password').populate('lastMessage');
    if (chat) return res.json({ chat });

    const memberExists = await User.findById(memberId);
    if (!memberExists) return res.status(404).json({ message: 'Member not found' });

    chat = await Chat.create({ isGroup: false, members, admins: [userId] });
    chat = await Chat.findById(chat._id).populate('members', '-password');
    res.status(201).json({ chat });
  } catch (err) { next(err) }
}

const getMyChats = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const chats = await Chat.find({ members: userId }).sort({ updatedAt: -1 }).populate('members', '-password').populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name avatar' } }).limit(50);
    res.json({ chats });
  } catch (err) { next(err) }
}

module.exports = { createOneToOne, getMyChats };
