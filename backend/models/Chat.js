const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  isGroup: { type: Boolean, default: false },
  name: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });

ChatSchema.index({ members: 1, updatedAt: -1 });

module.exports = mongoose.model('Chat', ChatSchema);
