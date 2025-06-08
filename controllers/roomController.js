const Room = require("../models/Room");
const Whiteboard = require("../models/Whiteboard");
const Message = require("../models/Message");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

/**
 * @desc    Create a new room
 * @route   POST /api/rooms
 * @access  Private
 */
exports.createRoom = async (req, res, next) => {
  try {
    const { name } = req.body;

    // Generate unique room ID
    const roomId = uuidv4();

    // Create room
    const room = await Room.create({
      name,
      roomId,
      createdBy: req.user.id,
      participants: [new mongoose.Types.ObjectId(req.user.id)],
    });

    // Create whiteboard for the room
    const whiteboard = await Whiteboard.create({
      room: room._id,
    });

    // Update room with whiteboard reference
    room.whiteboard = whiteboard._id;
    await room.save();

    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all rooms created by user or where user is a participant
 * @route   GET /api/rooms
 * @access  Private
 */
exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({
      $or: [{ createdBy: req.user.id }, { participants: req.user.id }],
    }).populate("createdBy", "username _id");

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single room
 * @route   GET /api/rooms/:id
 * @access  Private
 */
exports.getRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({ roomId: req.params.id })
      .populate("createdBy", "username")
      .populate("participants", "username");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Join a room by roomId
 * @route   POST /api/rooms/join
 * @access  Private
 */
exports.joinRoom = async (req, res, next) => {
  try {
    const { roomId } = req.body;

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Check if user is already in the room
    if (!room.participants.includes(req.user.id)) {
      room.participants.push(new mongoose.Types.ObjectId(req.user.id));
      await room.save();
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Leave a room
 * @route   DELETE /api/rooms/:id/leave
 * @access  Private
 */
exports.leaveRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({ roomId: req.params.id });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Remove user from participants
    room.participants = room.participants.filter(
      (participant) => participant.toString() !== req.user.id
    );

    await room.save();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete room
 * @route   DELETE /api/rooms/:id
 * @access  Private
 */
exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({ roomId: req.params.id });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Make sure user is room owner
    if (room.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this room",
      });
    }

    // Delete whiteboard
    await Whiteboard.findOneAndDelete({ room: room._id });

    // Delete room
    await room.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get room chat history
 * @route   GET /api/rooms/:id/messages
 * @access  Private
 */
exports.getRoomMessages = async (req, res, next) => {
  try {
    const room = await Room.findOne({ roomId: req.params.id });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const messages = await Message.find({ room: room._id })
      .populate("user", "username")
      .sort({ createdAt: 1 });

    // Format messages to match frontend requirements
    const formattedMessages = messages.map((msg) => ({
      userId: msg.user._id.toString(),
      username: msg.user.username,
      message: msg.content,
      timestamp: msg.createdAt.toISOString(),
    }));

    res.status(200).json({
      success: true,
      data: formattedMessages,
    });
  } catch (err) {
    next(err);
  }
};
