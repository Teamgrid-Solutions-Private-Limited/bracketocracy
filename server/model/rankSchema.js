const mongoose = require("mongoose");

const rankSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  rank: {
    type: Number,
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "seasons",
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

const rankModel = mongoose.model("ranks", rankSchema);
module.exports = rankModel;
