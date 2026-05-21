require("dotenv").config();
const http = require("http");
const app  = require("./app");
const connectDB  = require("./config/db");
app.set("trust proxy", 1);
// ⚠️ Inka use sahi se karna hoga niche
const { initSocket } = require("./config/socket");
const registerSocketEvents = require("./sockets/index");

const { startAllCrons }    = require("./services/cronService");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 8000;

// ── Create HTTP server from Express app ──────
const server = http.createServer(app);

// ── Bootstrap ────────────────────────────────
const bootstrap = async () => {
  // 1. Database and Cron Jobs connect karein
  await connectDB();
  startAllCrons();

  // 2. ⚠️ FIX: Apne config function ko use karke socket initialize karein
  // Yeh aapke baaki backend modules (like broadcastGPS) ko instance access karne dega
  const io = initSocket(server);

  // 3. ⚠️ FIX: Apne events handler ko attach karein (taaki connect/disconnect handle ho ske)
  registerSocketEvents(io);

  // 4. Server Start karein
  server.listen(PORT, () => {
    logger.info(`
    ╔═══════════════════════════════════════╗
    ║   🛡️  ShieldHer Backend Running       ║
    ║   Port     : ${PORT}                  ║
    ║   Env      : ${process.env.NODE_ENV || "development"}             ║
    ║   Socket.io: Initialized Properly 💥  ║
    ╚═══════════════════════════════════════╝
    `);
  });
};

bootstrap();

// ── Graceful shutdown ─────────────────────────
process.on("SIGTERM", () => {
  logger.warn("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
});

process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});