const {
  saveSubscription,
  sendNotification,
} = require("../services/subscriptionService");

// Handle subscription
const subscribe = async (req, res) => {
  try {
    const subscription = req.body;
    await saveSubscription(subscription);
    res.status(201).json({ message: "Subscription added successfully." });
  } catch (error) {
    console.error("Failed to subscribe:", error);
    res.status(500).json({ message: "Failed to subscribe." });
  }
};

// Handle push notification
const pushNotification = async (req, res) => {
  try {
    const { title, body } = req.body;
    await sendNotification(title, body);
    res.status(200).json({ message: "Notification sent successfully." });
  } catch (error) {
    console.error("Failed to send notification:", error);
    res.status(500).json({ message: "Failed to send notification." });
  }
};

module.exports = { subscribe, pushNotification };
