const express = require("express");
const {
  pushNotification,
  subscribe,
} = require("../controllers/subscriptionController");

const router = express.Router();

router.post("/subscribe", subscribe);
router.post("/push", pushNotification);

module.exports = router;
