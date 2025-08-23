let io;
let userSockets = {};       // Tracks primary socket for each user
let userSessions = {};      // Tracks all active sessions per user

function init(server) {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    // Health check
    socket.on("ping", (cb) => {
      if (typeof cb === "function") cb("pong");
    });

    // User registration
    socket.on("register", (userId) => {
      try {
        if (!userId) throw new Error("User ID is required");

        if (!userSessions[userId]) userSessions[userId] = [];

        userSessions[userId].push(socket.id);
        userSockets[userId] = socket.id; // primary socket

        console.log(`User ${userId} registered with socket ${socket.id}`);
        console.log(`Active sessions for ${userId}:`, userSessions[userId]);
      } catch (err) {
        console.error("Registration error:", err);
      }
    });

    // Login approval
    socket.on("approve_login", async (data, callback) => {
      try {
        const { loginId, approved, superAdminId } = data;
        if (!loginId || typeof approved !== "boolean" || !superAdminId) {
          throw new Error("Invalid data for approval");
        }

        const authController = require("./controllers/authController");
        await authController.approveLogin(data);

        if (typeof callback === "function") callback({ success: true });
      } catch (err) {
        console.error("Approval error:", err);
        if (typeof callback === "function") callback({ success: false, error: err.message });
      }
    });

    // Force logout handler
    socket.on("force_logout", async (userId) => {
      try {
        if (!userId) throw new Error("User ID is required");

        if (userSessions[userId]) {
          userSessions[userId].forEach(socketId => {
            io.to(socketId).emit("forced_logout", {
              reason: "logged_out_from_another_device",
              timestamp: new Date().toISOString(),
            });
          });

          // Clear sessions
          delete userSessions[userId];
          delete userSockets[userId];
        }
      } catch (err) {
        console.error("Force logout error:", err);
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);

      Object.keys(userSessions).forEach(uid => {
        userSessions[uid] = userSessions[uid].filter(id => id !== socket.id);

        if (userSessions[uid].length === 0) {
          delete userSessions[uid];
          delete userSockets[uid];
        } else if (userSockets[uid] === socket.id) {
          userSockets[uid] = userSessions[uid][0]; // assign new primary
        }
      });
    });

    // Error
    socket.on("connect_error", (err) => {
      console.log("Socket connection error:", err);
    });
  });

  return io;
}

function getIo() {
  if (!io) throw new Error("❌ Socket.io not initialized!");
  return io;
}

function getUserSockets() {
  return userSockets;
}

function getUserSessions() {
  return userSessions;
}

module.exports = {
  init,
  getIo,
  getUserSockets,
  getUserSessions
};
