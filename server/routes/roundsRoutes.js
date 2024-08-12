const express = require("express");
const {
  addRound,
  viewRound,
  deleteRound,
  updateRound,
  searchRoundBySlug,
} = require("../controllers/roundController");

const router = express.Router();

router.post("/round/create", addRound);
router.get("/round/view", viewRound);
router.delete("/round/delete/:id", deleteRound);
router.put("/round/editround/:id", updateRound);
// router.get('/viewzonebyid/:id',searchzone);
router.get("/round/searchslug/:slug", searchRoundBySlug);

module.exports = router;
