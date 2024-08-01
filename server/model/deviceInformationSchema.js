const mongoose = require("mongoose");

const deviceInformationSchema = mongoose.Schema({
  deviceType: { type: String },
  deviceToken: { type: String },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: { type: Date, default: Date.now },
});

const deviceinfo = mongoose.model("deviceinfos", deviceInformationSchema);
module.exports = deviceinfo;
