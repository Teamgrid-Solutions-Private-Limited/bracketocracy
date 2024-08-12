const express = require("express");
const router = express.Router();
const {
  placeBet,
  handleMatchEnd,
  getUserBets,
} = require("../controllers/bettingController");

// Route to place a bet
router.post("/bet/placebet", placeBet);

// Route to handle end of match
router.post("/bet/handle-match-end/:matchId", handleMatchEnd);

// Route to get user bets
router.get("/bet/user-bets/:userId", getUserBets);

module.exports = router;
