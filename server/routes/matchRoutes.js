const express = require("express");
 
const {
  createMatch,
  getMatchById,
  updateMatch,
  deleteMatch,
  finalScores,
  getMatch,
} = require("../controllers/matchController");

const router = express.Router();
router.post("/match/create", createMatch);
router.get("/match/search/:id", getMatchById);
router.delete("/match/delete/:id", deleteMatch);
router.put("/match/update/:id",updateMatch);
router.put("/match/final/:id",finalScores)
router.get("/match/view",getMatch);
 
module.exports = router;
