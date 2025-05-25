const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a room name"],
    trim: true,
    maxlength: [100, "Room name cannot be more than 100 characters"],
  },
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  participants: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  whiteboard: {
    type: mongoose.Schema.ObjectId,
    ref: "Whiteboard",
  },
  messages: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Message",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Cascade delete whiteboard when room is deleted
RoomSchema.pre("deleteOne", async function (next) {
  await this.model("Whiteboard").deleteOne({ _id: this.whiteboard });
  next();
});

module.exports = mongoose.model("Room", RoomSchema);
