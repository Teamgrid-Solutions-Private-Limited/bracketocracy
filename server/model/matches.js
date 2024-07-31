const mongoose = require("mongoose");
const team = require("./teams");
const userSchema = mongoose.Schema({
  teamOneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teams",
    required: true,
  },
  teamTwoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teams",
    required: true,
  },
  teamOneScore: {
    type: Number,
    
  },
  teamTwoScore: {
    type: Number,
     
  },
  finalscore: {
    type: Number,
  },
  decidedWinner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teams",
    required: true,
  },
  status:{type:Number},
  roundSlug: {
    type: String,
  },
  zoneSlug: {
    type: String,
  },
  matchNo: {
    type: Number,
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "season",
  },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

const userModel = mongoose.model("matches", userSchema);

module.exports = userModel;
