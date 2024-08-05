const express = require("express");
const {
  addRound,
  viewRound,
  deleteRound,
  updateRound,
  searchRoundBySlug,
} = require("../controllers/roundController");

const router = express.Router();

router.post("/newround", addRound);
router.get("/viewround", viewRound);
router.delete("/delete", deleteRound);
router.put("/editround/:id", updateRound);
// router.get('/viewzonebyid/:id',searchzone);
router.get("/roundbyslug/:slug", searchRoundBySlug);

module.exports = router;
