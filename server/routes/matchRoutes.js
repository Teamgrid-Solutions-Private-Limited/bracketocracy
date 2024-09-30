const express = require("express");
const router = express.Router();
const MatchController = require("../controllers/matchController");

// Create matches for the next round using winners from the previous round
router.post("/matches/createNextRound", MatchController.createNextRound);

// Automatically progress teams from each zone to the finals
router.post("/matches/championmatch", MatchController.createChampionshipMatch);

// Create final four matches
router.post(
  "/matches/progressToFinalFour",
  MatchController.progressToFinalFour
);

// Get a single match by ID
router.get("/matches/:id", MatchController.getMatchById);

// Update final scores and determine the winner
router.put("/matches/:id/finalScores", MatchController.finalScores);

// Delete a match by ID
router.delete("/matches/:id", MatchController.deleteMatch);

// Update a match
router.put("/matches/:id", MatchController.updateMatch);

// Get all matches with populated details
router.get("/matches", MatchController.getMatch);

module.exports = router;
