const express = require("express");
const RoundController = require("../controllers/roundController");

const router = express.Router();

//router.post("/round/create", addRound);
//router.get("/round/view", viewRound);
//router.delete("/round/delete/:id", deleteRound);
//router.put("/round/editround/:id", updateRound);
// router.get('/viewzonebyid/:id',searchzone);
//router.get("/round/searchslug/:slug", searchRoundBySlug);
// Initialize the first round (Round 1) for all zones
router.post("/rounds/initialize", RoundController.initializeRoundOne);

// Complete the current round and create the next round
router.post("/rounds/complete", RoundController.completeRoundAndCreateNext);

// Create the championship round
router.post("/rounds/championship", RoundController.createChampionship);

module.exports = router;
