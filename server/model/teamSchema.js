const mongoose = require("mongoose");

const teamSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    required: true,
    enum: [0, 1, 2, 3, 4], // Valid statuses
    default: 0, // Default value
  },
  seasonId: {
    type: mongoose.Types.ObjectId,
    ref: "seasons",
  },
  seed: {
    type: Number,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

const teamModel = mongoose.model("teams", teamSchema);

module.exports = teamModel;
