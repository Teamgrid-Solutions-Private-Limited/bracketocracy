const admin = require("firebase-admin");

class PushNotificationService {
  async registerDeviceForPushNotifications(deviceToken) {
    try {
      const response = await messaging.getToken(deviceToken);
      console.log("Device registered for push notifications:", response);
      return response;
    } catch (error) {
      console.error("Error registering device for push notifications:", error);
      throw error;
    }
  }

  async subscribeToTopic(deviceToken, topic) {
    try {
      await messaging.subscribeToTopic(deviceToken, topic);
      console.log(`Device subscribed to topic ${topic} successfully`);
    } catch (error) {
      console.error(`Error subscribing to topic: ${error}`);
      throw error;
    }
  }

  async unsubscribeFromTopic(deviceToken, topic) {
    try {
      await messaging.unsubscribeFromTopic(deviceToken, topic);
      console.log(`Device unsubscribed from topic ${topic} successfully`);
    } catch (error) {
      console.error(`Error unsubscribing from topic: ${error}`);
      throw error;
    }
  }

  async sendNotificationToDevice(deviceToken, notification) {
    try {
      const response = await messaging.sendToDevice(deviceToken, notification);
      console.log("Notification sent successfully:", response);
      return response;
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  }

  async sendNotificationToTopic(topic, notification) {
    try {
      const response = await messaging.sendToTopic(topic, notification);
      console.log("Notification sent successfully:", response);
      return response;
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  }

  async sendNotificationToCondition(condition, notification) {
    try {
      const response = await messaging.sendToCondition(condition, notification);
      console.log("Notification sent successfully:", response);
      return response;
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  }
}

module.exports = PushNotificationService;
