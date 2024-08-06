const express = require("express");
 
const {
  createMatch,
  getMatchById,
  updateMatch,
  deleteMatch,
  finalScores,
} = require("../controllers/matchController");

const router = express.Router();
router.post("/create", createMatch);
router.get("/search/:id", getMatchById);
router.delete("/delete/:id", deleteMatch);
router.put("/update/:id",updateMatch);
router.put("/final/:id",finalScores)
 
module.exports = router;
