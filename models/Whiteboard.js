const mongoose = require("mongoose");

const WhiteboardSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.ObjectId,
    ref: "Room",
    required: true,
  },
  elements: {
    type: Array,
    default: [],
  },
  // Store the canvas data as base64 string
  imageData: {
    type: String,
    default: null,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Update lastUpdated timestamp before save
WhiteboardSchema.pre("save", function (next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model("Whiteboard", WhiteboardSchema);
