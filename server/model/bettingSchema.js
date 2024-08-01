const mongoose = require("mongoose");

const bettingSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "matches",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  selectedWinner: {
    type: Number,
    required: true,
  },
  status: {
    type: Number,
  },
  score: {
    type: Number,
    default: 0,
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "seasons", //reference from season need to create
  },
});

const Betting = mongoose.model("bettings", bettingSchema);

module.exports = Betting;
