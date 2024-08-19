const express = require("express");
const router = express.Router();
const PushNotificationController = require("../controllers/pushnotificationController");

// Route to send a notification to a device
router.post("/send", PushNotificationController.sendNotification);

// Route to subscribe a device to a topic
router.post("/subscribe", PushNotificationController.subscribeToTopic);

module.exports = router;
