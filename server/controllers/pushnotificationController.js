const PushNotificationService = require("../services/pushNotificationService");

class PushNotificationController {
  static async sendNotification(req, res) {
    const { deviceToken, title, body } = req.body;

    try {
      const response = await PushNotificationService.sendNotificationToDevice(
        deviceToken,
        title,
        body
      );
      res.status(200).json({
        message: "Notification sent successfully",
        response,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to send notification",
        error: error.message,
      });
    }
  }

  static async subscribeToTopic(req, res) {
    const { deviceToken, topic } = req.body;

    try {
      const response = await PushNotificationService.subscribeToTopic(
        deviceToken,
        topic
      );
      res.status(200).json({
        message: `Successfully subscribed to topic ${topic}`,
        response,
      });
    } catch (error) {
      res.status(500).json({
        message: `Failed to subscribe to topic ${topic}`,
        error: error.message,
      });
    }
  }
}

module.exports = PushNotificationController;
