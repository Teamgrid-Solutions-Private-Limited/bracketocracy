const express = require("express");
const router = express.Router();
const {
  placeBet,
  handleMatchEnd,
  getUserBets,
  updateBet,
} = require("../controllers/bettingController");

// Route to place a bet
router.post("/bet/placebet", placeBet);

// Route to handle end of match
router.post("/bet/handle-match-end/:matchId", handleMatchEnd);

// Route to get user bets
router.get("/bet/user-bets/:userId", getUserBets);
router.put("/round/update/:id", updateBet);

module.exports = router;
