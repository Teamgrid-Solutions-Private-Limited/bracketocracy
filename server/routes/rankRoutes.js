const express = require("express");
const {
  savedRank,
  getRank,
  getRanks,
} = require("../controllers/rankController");

const router = express.Router();
router.post("/calculate-ranks", savedRank);
router.get("/:seasonId", getRanks);

module.exports = router;
