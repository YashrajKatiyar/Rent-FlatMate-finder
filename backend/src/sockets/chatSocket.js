const jwt = require('jsonwebtoken');
const User = require('../models/User');
const InterestRequest = require('../models/InterestRequest');
const Message = require('../models/Message');

function initChatSocket(io) {
  // Authenticate every socket connection using the JWT sent in the handshake
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication token missing'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    // Client joins a room scoped to a specific accepted interest request
    socket.on('join_room', async ({ interestId }, callback) => {
      try {
        const interest = await InterestRequest.findById(interestId);
        if (!interest || interest.status !== 'accepted') {
          return callback?.({ success: false, message: 'Chat not available for this request' });
        }
        const isParticipant =
          String(interest.tenant) === String(socket.user._id) || String(interest.owner) === String(socket.user._id);
        if (!isParticipant) {
          return callback?.({ success: false, message: 'Not a participant in this conversation' });
        }
        socket.join(`interest:${interestId}`);
        callback?.({ success: true });
      } catch (err) {
        callback?.({ success: false, message: err.message });
      }
    });

    // Send + persist a chat message, then broadcast to the room
    socket.on('send_message', async ({ interestId, text }, callback) => {
      try {
        if (!text || !text.trim()) {
          return callback?.({ success: false, message: 'Message text cannot be empty' });
        }
        const interest = await InterestRequest.findById(interestId);
        if (!interest || interest.status !== 'accepted') {
          return callback?.({ success: false, message: 'Chat not available for this request' });
        }
        const isParticipant =
          String(interest.tenant) === String(socket.user._id) || String(interest.owner) === String(socket.user._id);
        if (!isParticipant) {
          return callback?.({ success: false, message: 'Not a participant in this conversation' });
        }

        const message = await Message.create({
          interestRequest: interestId,
          sender: socket.user._id,
          text: text.trim(),
        });

        const payload = {
          _id: message._id,
          interestRequest: interestId,
          sender: { _id: socket.user._id, name: socket.user.name, role: socket.user.role },
          text: message.text,
          createdAt: message.createdAt,
        };

        io.to(`interest:${interestId}`).emit('new_message', payload);
        callback?.({ success: true, data: payload });
      } catch (err) {
        callback?.({ success: false, message: err.message });
      }
    });

    socket.on('typing', ({ interestId }) => {
      socket.to(`interest:${interestId}`).emit('user_typing', { userId: socket.user._id, name: socket.user.name });
    });

    socket.on('disconnect', () => {
      // no-op: rooms are cleaned up automatically by socket.io
    });
  });
}

module.exports = initChatSocket;
