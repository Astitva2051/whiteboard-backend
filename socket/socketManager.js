const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Room = require("../models/Room");

let io;

/**
 * Initialize Socket.IO and set up events
 */
exports.init = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      // Get token from handshake auth
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error("User not found"));
      }

      // Set user data in socket
      socket.user = {
        id: user._id,
        username: user.username,
      };

      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);

    // Join room
    socket.on("join-room", async ({ roomId }) => {
      try {
        const room = await Room.findOne({ roomId });

        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        // Join socket to room
        socket.join(roomId);

        // Notify others in the room
        socket.to(roomId).emit("user-connected", {
          userId: socket.user.id,
          username: socket.user.username,
        });

        // Send current users in the room
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        const users = await Promise.all(
          clients.map(async (clientId) => {
            const clientSocket = io.sockets.sockets.get(clientId);
            return clientSocket.user;
          })
        );

        socket.emit("room-users", users);

        console.log(`${socket.user.username} joined room: ${roomId}`);
      } catch (error) {
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Leave room
    socket.on("leave-room", ({ roomId }) => {
      socket.leave(roomId);
      socket.to(roomId).emit("user-disconnected", {
        userId: socket.user.id,
        username: socket.user.username,
      });
      console.log(`${socket.user.username} left room: ${roomId}`);
    });

    // Drawing events
    socket.on("draw-start", ({ roomId, x, y, color, width }) => {
      socket.to(roomId).emit("draw-start", {
        userId: socket.user.id,
        x,
        y,
        color,
        width,
      });
    });

    socket.on("draw-move", ({ roomId, x, y }) => {
      socket.to(roomId).emit("draw-move", {
        userId: socket.user.id,
        x,
        y,
      });
    });

    socket.on("draw-end", ({ roomId }) => {
      socket.to(roomId).emit("draw-end", {
        userId: socket.user.id,
      });
    });

    // Add element (path, shape, text, erase, etc.)
    socket.on("add-element", ({ roomId, element }) => {
      // Broadcast to all users in the room except sender
      socket.to(roomId).emit("add-element", {
        userId: socket.user.id,
        element,
      });
    });

    // Add text
    socket.on("add-text", ({ roomId, text, x, y, fontSize, color }) => {
      socket.to(roomId).emit("add-text", {
        userId: socket.user.id,
        text,
        x,
        y,
        fontSize,
        color,
      });
    });

    // Add shape
    socket.on("add-shape", ({ roomId, type, x, y, width, height, color }) => {
      socket.to(roomId).emit("add-shape", {
        userId: socket.user.id,
        type,
        x,
        y,
        width,
        height,
        color,
      });
    });

    // Clear board
    socket.on("clear-board", ({ roomId }) => {
      socket.to(roomId).emit("clear-board", {
        userId: socket.user.id,
      });
    });

    // Chat message
    socket.on("send-message", ({ roomId, message }) => {
      io.to(roomId).emit("receive-message", {
        userId: socket.user.id,
        username: socket.user.username,
        message,
        timestamp: new Date(),
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.username} (${socket.id})`);

      // Get all rooms the socket was in
      const rooms = Array.from(socket.rooms || []);

      // Notify each room
      rooms.forEach((roomId) => {
        if (roomId !== socket.id) {
          // Ignore the default room (socket.id)
          socket.to(roomId).emit("user-disconnected", {
            userId: socket.user.id,
            username: socket.user.username,
          });
          console.log(
            `${socket.user.username} disconnected from room: ${roomId}`
          );
        }
      });
    });
  });

  return io;
};

/**
 * Get the socket.io instance
 */
exports.getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
/**
 * Emit an event to a specific room
 */
