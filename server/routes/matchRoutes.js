// routes/matchRoutes.js

const express = require("express");
const router = express.Router();
const matchController = require("../controllers/matchController");

// Initialize Round One
router.post("/initializeRoundOne", matchController.initializeRoundOne);

// Create Matches for Next Round
router.post("/createNextRound", matchController.createNextRound);

// Progress to Next Round
router.post("/progressToNextRound", matchController.progressToNextRound);

// Create a Match
router.post("/create", matchController.createMatch);

// Get a Match by ID
router.get("/:id", matchController.getMatchById);

// Update Final Scores
router.patch("/:id/finalScores", matchController.finalScores);

// Delete a Match
router.delete("/:id", matchController.deleteMatch);

// Update a Match
router.put("/:id", matchController.updateMatch);

// Get All Matches
//router.get("/", matchController.getMatch);

module.exports = router;
