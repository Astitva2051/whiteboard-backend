const express = require("express");
const router = express.Router();
const {
  getWhiteboard,
  saveWhiteboard,
  clearWhiteboard,
} = require("../controllers/whiteboardController");
const { protect } = require("../middleware/auth");

router
  .route("/:roomId")
  .get(protect, getWhiteboard)
  .put(protect, saveWhiteboard);

router.delete("/:roomId/clear", protect, clearWhiteboard);

module.exports = router;
