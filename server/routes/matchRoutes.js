const express = require("express");
const router = express.Router();
const MatchController = require("../controllers/matchController");

// Route to create matches for the first round manually
router.post("/matches/playin", MatchController.createMatchesForFirstRound);

// Route to progress to the next round
router.post("/matches/progress", MatchController.progressToNextRound);

// Route to update the final scores of a match
router.put("/matches/:id/scores", MatchController.finalScores);

// Route to get details of a single match by ID
router.get("/matches/:id", MatchController.getMatchById);

// Route to delete a match by ID
router.delete("/matches/:id", MatchController.deleteMatch);

// Route to get all matches with team and round details
router.get("/matches", MatchController.getAllMatches);

module.exports = router;
