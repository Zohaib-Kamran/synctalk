const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const userSocketMap = new Map();

function initSockets(server) {
  io = new Server(server, { cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173', methods: ['GET', 'POST'], credentials: true } });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next();
    try {
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.user = payload;
    } catch (err) {
      // proceed without attaching user; guarded events should check
    }
    next();
  });

  io.on('connection', (socket) => {
    if (socket.user?.id) {
      userSocketMap.set(String(socket.user.id), socket.id);
      socket.join(socket.user.id);
      io.emit('presence:update', { userId: socket.user.id, online: true });
    }

    socket.on('join:chat', (chatId) => { socket.join(chatId); });

    socket.on('typing', ({ chatId, typing }) => { socket.to(chatId).emit('typing', { userId: socket.user?.id, typing }); });

    socket.on('disconnect', () => {
      if (socket.user?.id) {
        userSocketMap.delete(String(socket.user.id));
        io.emit('presence:update', { userId: socket.user.id, online: false, lastSeen: new Date() });
      }
    });
  });
}

module.exports = { initSockets };
