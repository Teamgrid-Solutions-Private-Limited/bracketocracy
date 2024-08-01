const express = require("express");
const {
  addround,
  viewRound,
  deleteRound,
  updateRound,
  searchRoundBySlug,
} = require("../controllers/RoundController");

const router = express.Router();

router.post("/newround", addround);
router.get("/viewround", viewRound);
router.delete("/delete", deleteRound);
router.put("/editround/:id", updateRound);
// router.get('/viewzonebyid/:id',searchzone);
router.get("/roundbyslug/:slug", searchRoundBySlug);

module.exports = router;
