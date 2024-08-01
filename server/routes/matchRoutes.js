const express = require("express");
 
const {
  createMatch,
  getMatchById,
  updateMatch,
  deleteMatch,
} = require("../controllers/MatchController");

const router = express.Router();
router.post("/create", createMatch);
router.get("/search/:id", getMatchById);
router.delete("/delete/:id", deleteMatch);
router.put("/update/:id",updateMatch);
 
module.exports = router;
