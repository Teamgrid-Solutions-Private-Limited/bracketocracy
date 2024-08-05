 
const Notification = require("../model/notificationSchema");

class notificationController
{

// Create a notification API endpoint
static createNotification = async (req, res, next) => {
  try {
    // Check if the request body is empty

    // Check if the required fields are present
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
}

module.exports = notificationController;
