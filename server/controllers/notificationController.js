const Notification = require("../model/notificationSchema");

class notificationController {
  static createNotification = async (req, res, next) => {
    try {
      const { userId, notificationTitle, notificationText, status } = req.body;

      if (!userId) {
        return res
          .status(400)
          .json({ message: "Missing required field: userId" });
      }
      if (!notificationTitle) {
        return res
          .status(400)
          .json({ message: "Missing required field:notificationTitle " });
      }
      if (!notificationText) {
        return res
          .status(400)
          .json({ message: "Missing required field: notificationText" });
      }
      if (!status) {
        return res
          .status(400)
          .json({ message: "Missing required field: status" });
      }
      // Create a new notification
      const notification = new Notification(req.body);
      const result = await notification.save();

      // Return a success response
      res
        .status(201)
        .json({ message: "Notification created successfully", result });
    } catch (err) {
      console.error("Error in addnotification function:", err);
      res.status(500).json({ message: "Error creating notification" });
    }
  };

  static getNotifications = async (req, res, next) => {
    try {
      const { userId, status } = req.query;

      // Build query object
      let query = {};
      if (userId) query.userId = userId;
      if (status) query.status = status;

      // Retrieve notifications
      const notifications = await Notification.find(query);

      // Return success response
      res
        .status(200)
        .json({
          message: "Notifications retrieved successfully",
          notifications,
        });
    } catch (err) {
      console.error("Error in getNotifications function:", err);
      res.status(500).json({ message: "Error retrieving notifications" });
    }
  };
}

module.exports = notificationController;
