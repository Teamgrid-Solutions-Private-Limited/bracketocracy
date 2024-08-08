const express = require("express");
const {
  createSetting,
  getSetting,
  updateSetting,
  deleteSetting,
} = require("../controllers/settingController");
const checkUser = require("../middleware/checkUser");
const checkAdmin = require("../middleware/checkAdmin");

const router = express.Router();

router.post("/addSetting", checkAdmin, createSetting);

router.get("/:settingKey", checkUser, getSetting);

router.delete("/delete/:settingKey", checkAdmin, deleteSetting);
router.put("/update/:settingKey", checkAdmin, updateSetting);

module.exports = router;
