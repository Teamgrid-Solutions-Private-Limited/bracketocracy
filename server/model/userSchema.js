const mongoose = require("mongoose");
 
const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique:true
  },
  userName: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  profilePhoto: {
    type: String,
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "roles",
  },
  active: {
    type: String,
    enum: ['yes', 'no'], // Only allow 'yes' or 'no'
    default: 'no',
  },
  authType: {
    type: Number,
  },
  socialMediaId: {
    type: String,
  },
  score: {
    type: Number,
    index: -1,
    default: 0,
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
 
//score: { type: Number, index: true }
 
const userModel = mongoose.model("users", userSchema);
module.exports = userModel;