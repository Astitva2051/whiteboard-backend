const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const socketManager = require("./socket/socketManager");
const errorMiddleware = require("./middleware/error");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize app
const app = express();
const server = http.createServer(app);

// Initialize socket.io
const io = socketManager.init(server);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/rooms", require("./routes/room"));
app.use("/api/whiteboards", require("./routes/whiteboard"));

// Error handler middleware
app.use(errorMiddleware);

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
