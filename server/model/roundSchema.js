const mongoose = require("mongoose");
 

const roundSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
  },
  playDate: {
    type: String,
    required: true,
  },
  biddingEndDate: {
    type: String,
    require: true,
  },
  roundNumber:{type:Number,required:true},
  status: {
    type: Boolean,
    default: true,
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId, //reference to season collection
    ref: "seasons",
    required: true,
  },

  totalMatch: {
    type: Number,
  },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

const roundModel = mongoose.model("rounds", roundSchema);

module.exports = roundModel;
