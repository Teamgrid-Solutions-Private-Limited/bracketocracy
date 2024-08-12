const mongoose = require("mongoose");

const bettingSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "matches",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  selectedWinner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teams",
  },
  status: {
    type: Number,
    default: 0,
  },
  // score: {
  //   type: Number,

  // },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "seasons", //reference from season need to create
  },
});

const Betting = mongoose.model("bettings", bettingSchema);

module.exports = Betting;
