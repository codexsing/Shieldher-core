// ─────────────────────────────────────────────
// sockets/index.js — registers all socket events
// ─────────────────────────────────────────────
const jwt    = require("jsonwebtoken");
const logger = require("../utils/logger");

const registerSocketEvents = (io) => {
  // ── Auth middleware for sockets ──
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));
    try {
      const decoded  = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId  = decoded.id;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id} | User: ${socket.userId}`);

    // Every user joins their personal room so guardians can watch them
    socket.join(`user:${socket.userId}`);

    // ── SOS Events ─────────────────────────────
    socket.on("sos:join_room", ({ sosId }) => {
      socket.join(`sos:${sosId}`);
      logger.info(`Socket ${socket.id} joined SOS room: sos:${sosId}`);
    });

    socket.on("sos:leave_room", ({ sosId }) => {
      socket.leave(`sos:${sosId}`);
    });

    // Live GPS ping from client (alternative to REST)
    socket.on("sos:gps_ping", ({ sosId, lat, lng }) => {
      io.to(`sos:${sosId}`).emit("sos:gps_update", {
        lat, lng, timestamp: new Date(), userId: socket.userId,
      });
    });

    // ── Journey Events ─────────────────────────
    socket.on("journey:start_watch", ({ journeyId }) => {
      socket.join(`journey:${journeyId}`);
    });

    socket.on("journey:gps_ping", ({ journeyId, lat, lng }) => {
      io.to(`journey:${journeyId}`).emit("journey:location_update", {
        lat, lng, timestamp: new Date(),
      });
    });

    socket.on("journey:stop_watch", ({ journeyId }) => {
      socket.leave(`journey:${journeyId}`);
    });

    // ── Guardian watching ──────────────────────
    socket.on("guardian:watch_user", ({ targetUserId }) => {
      socket.join(`user:${targetUserId}`);
      logger.info(`Guardian ${socket.userId} watching user ${targetUserId}`);
    });

    socket.on("guardian:unwatch_user", ({ targetUserId }) => {
      socket.leave(`user:${targetUserId}`);
    });

    // ── Disconnect ────────────────────────────
    socket.on("disconnect", (reason) => {
      logger.info(`Socket disconnected: ${socket.id} | Reason: ${reason}`);
    });
  });
};

module.exports = registerSocketEvents;
