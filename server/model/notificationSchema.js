const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  notificationTitle: {
    type: String,
  },
  notificationText: {
    type: String,
  },
  status: {
    type: Number,
  },
  read: {
    type: Boolean,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

notificationModel = mongoose.model("notifications", notificationSchema);
module.exports = notificationModel;
