require('dotenv').config();
const express = require('express');
const http    = require('http');
const cors    = require('cors');
const morgan  = require('morgan');
const { Server } = require('socket.io');
const jwt     = require('jsonwebtoken');
const connectDB = require('./config/db');

const app    = express();
const server = http.createServer(app);

// ─── Socket.io ───────────────────────────────────────────────────────────────
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const io = new Server(server, {
  cors: { origin: CLIENT_URL, credentials: true },
});

// Auth middleware for Socket.io
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

// Track connections
io.on('connection', (socket) => {
  // Join user-specific room
  socket.join(`user:${socket.userId}`);

  // Board room management
  socket.on('join-board', (boardId) => {
    socket.join(`board:${boardId}`);
  });

  socket.on('leave-board', (boardId) => {
    socket.leave(`board:${boardId}`);
  });

  socket.on('disconnect', () => {
    // Auto-cleaned by Socket.io
  });
});

// Make io accessible to routes/services
app.set('io', io);

// ─── Connect DB ───────────────────────────────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/users',         require('./routes/user.routes'));
app.use('/api/departments',   require('./routes/department.routes'));
app.use('/api/boards',        require('./routes/board.routes'));
app.use('/api/cards',         require('./routes/card.routes'));
app.use('/api/analytics',     require('./routes/analytics.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/invites',       require('./routes/invite.routes'));
app.use('/api/cards',         require('./routes/upload.routes')); // attachment upload/delete

// ─── Static files (uploads) ──────────────────────────────────────────────────
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Start due-date reminder scheduler
  require('./services/scheduler');
});

module.exports = { app, server, io };
