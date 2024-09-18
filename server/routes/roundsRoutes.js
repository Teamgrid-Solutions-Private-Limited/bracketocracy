const express = require("express");
const {
  addRound,
  viewRound,
  deleteRound,
  updateRound,
  searchRoundBySlug,
  // completeRoundAndCreateNext,
} = require("../controllers/roundController");

const router = express.Router();

router.post("/round/create", addRound);
router.get("/round/view", viewRound);
router.delete("/round/delete/:id", deleteRound);
router.put("/round/editround/:id", updateRound);
// router.get('/viewzonebyid/:id',searchzone);
// router.post("/complete/:roundId", completeRoundAndCreateNext);
router.get("/round/searchslug/:slug", searchRoundBySlug);

module.exports = router;
