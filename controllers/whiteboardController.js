const Whiteboard = require("../models/Whiteboard");
const Room = require("../models/Room");

/**
 * @desc    Get whiteboard by room ID
 * @route   GET /api/whiteboards/:roomId
 * @access  Private
 */
exports.getWhiteboard = async (req, res, next) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const whiteboard = await Whiteboard.findOne({ room: room._id });

    if (!whiteboard) {
      return res.status(404).json({
        success: false,
        message: "Whiteboard not found",
      });
    }

    res.status(200).json({
      success: true,
      data: whiteboard,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Save whiteboard
 * @route   PUT /api/whiteboards/:roomId
 * @access  Private
 */
exports.saveWhiteboard = async (req, res, next) => {
  try {
    const { elements, imageData } = req.body;
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Check if user is in the room
    if (!room.participants.includes(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this whiteboard",
      });
    }

    let whiteboard = await Whiteboard.findOne({ room: room._id });

    if (!whiteboard) {
      // Create a new whiteboard if it doesn't exist
      whiteboard = await Whiteboard.create({
        room: room._id,
        elements,
        imageData,
      });
    } else {
      // Update existing whiteboard
      whiteboard.elements = elements;
      whiteboard.imageData = imageData;
      await whiteboard.save();
    }

    res.status(200).json({
      success: true,
      data: whiteboard,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Clear whiteboard
 * @route   DELETE /api/whiteboards/:roomId/clear
 * @access  Private
 */
exports.clearWhiteboard = async (req, res, next) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Check if user is in the room
    if (!room.participants.includes(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to clear this whiteboard",
      });
    }

    const whiteboard = await Whiteboard.findOne({ room: room._id });

    if (!whiteboard) {
      return res.status(404).json({
        success: false,
        message: "Whiteboard not found",
      });
    }

    // Clear whiteboard data
    whiteboard.elements = [];
    whiteboard.imageData = null;
    await whiteboard.save();

    res.status(200).json({
      success: true,
      data: whiteboard,
    });
  } catch (err) {
    next(err);
  }
};
