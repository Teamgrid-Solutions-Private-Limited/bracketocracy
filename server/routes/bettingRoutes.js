const express = require("express");
const {
  createBetting,
  getAllBettingById,
  updateBetting,
  getAllBetting,
  deleteBetting,
} = require("../controllers/bettingController");

const router = express.Router();
router.post("/create", createBetting);
router.get("/search", getAllBetting);
router.get("/search/:id", getAllBettingById);
router.delete("/delete/:id", deleteBetting);
router.put("/update/:id", updateBetting);

module.exports = router;
