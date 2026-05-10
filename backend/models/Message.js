const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  attachments: [{ url: String, type: String, name: String }],
  deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  edited: { type: Boolean, default: false },
}, { timestamps: true });

MessageSchema.index({ chat: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
