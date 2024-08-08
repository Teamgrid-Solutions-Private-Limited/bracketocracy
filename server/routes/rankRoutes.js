const express = require("express");
const { savedRank, getRank } = require("../controllers/rankController");

const router = express.Router();
router.post("/calculate-ranks", savedRank);
router.get("/:id", getRank);

module.exports = router;
