const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chats');
const messageRoutes = require('./routes/messages');
const { initSockets } = require('./sockets');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Basic middleware
app.use(helmet());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('tiny'));

// CORS - restrict in production via env
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));

// Rate limiter
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

// Error handler
app.use(errorHandler);

// Start
(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    // sockets
    initSockets(server);
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => console.log(`SyncTalk backend running on port ${PORT}`));
  } catch (err) {
    console.error('Startup error', err);
    process.exit(1);
  }
})();
