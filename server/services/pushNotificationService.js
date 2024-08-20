const admin = require("../config/firebaseConfig");
const Device = require("../model/deviceInformationSchema");

class PushNotificationService {
  static async sendNotificationToDevice(deviceToken, title, body) {
    const message = {
      notification: {
        title,
        body,
      },
      token: deviceToken,
    };

    try {
      const response = await admin.messaging().send(message);

      // Store notification in the device's history
      await Device.updateOne(
        { deviceToken },
        {
          $push: {
            notificationHistory: {
              title,
              message: body,
              sentDate: new Date(),
            },
          },
        }
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  static async subscribeToTopic(deviceToken, topic) {
    try {
      const response = await admin
        .messaging()
        .subscribeToTopic(deviceToken, topic);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PushNotificationService;
