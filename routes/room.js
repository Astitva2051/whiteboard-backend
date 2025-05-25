const express = require("express");
const router = express.Router();
const {
  createRoom,
  getRooms,
  getRoom,
  joinRoom,
  leaveRoom,
  deleteRoom,
  getRoomMessages,
} = require("../controllers/roomController");
const { protect } = require("../middleware/auth");

router.route("/").get(protect, getRooms).post(protect, createRoom);

router.post("/join", protect, joinRoom);

router.route("/:id").get(protect, getRoom).delete(protect, deleteRoom);

router.delete("/:id/leave", protect, leaveRoom);
router.get("/:id/messages", protect, getRoomMessages);

module.exports = router;
