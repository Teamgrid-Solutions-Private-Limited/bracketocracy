const express = require("express");
const router = express.Router();
const deviceController = require("../controllers/deviceController");

router.post("/register", deviceController.registerDevice);
router.get("/", deviceController.getDevices);

module.exports = router;
