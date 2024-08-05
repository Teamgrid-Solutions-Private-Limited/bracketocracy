const express = require("express");
const upload = require("../middleware/fileUpload");
const {
  addTeam,
  displayAll,
  deleteTeam,
  updateTeam,
  displayById,
} = require("../controllers/teamController");
const router = express.Router();

router.post("/createteam", addTeam);
router.get("/display", displayAll);
router.get("/display/:id", displayById);
router.delete("/delete/:id", deleteTeam);
router.put("/update/:id", updateTeam);

module.exports = router;
