const express = require('express');
const router = express.Router();
const {placeBet,handleMatchEnd,getUserBets} = require('../controllers/bettingController');
 

// Route to place a bet
router.post('/place-bet',placeBet);

// Route to handle end of match
router.post('/handle-match-end/:matchId',handleMatchEnd);

// Route to get user bets
router.get('/user-bets',getUserBets);

module.exports = router;
