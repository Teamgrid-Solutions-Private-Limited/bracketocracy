const mongoose = require("mongoose");

const deviceInformationSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  deviceToken: { type: String, required: true },
  deviceInfo: { type: String, required: true }, // Store device information (e.g., model, OS)
  notificationHistory: [
    {
      title: { type: String, required: true },
      message: { type: String, required: true },
      sentDate: { type: Date, default: Date.now },
    },
  ],
});

const deviceinfo = mongoose.model("deviceinfos", deviceInformationSchema);
module.exports = deviceinfo;
