 
const Notification = require("../model/adminNotificationSchema");

class adminNotificationController
{

 
static createNotification = async (req, res, next) => {
  try {
    // Check if the request body is empty

    // Check if the required fields are present
    const { notificationTitle, notificationText} = req.body;

   
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
static notificationDelete =async(req,res)=>{
    try{
        const countId= req.params.id;
    const data = await Notification.findByIdandDelete(countId);

    res.status(201).json({message:"notification deleted successfully",info:data});
    }
    
catch(err)
{
    res.status(404).json({error:err.message});
}
}
static viewAll = async (req, res) => {
    try {
        const data = await Notification.find();
        res.status(201).json({ message: "notification retrive successfully", info: data });
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
}
static updatedNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;


        const updatedNotification = await Notification.findByIdAndUpdate(id, { $set: update }, { new: true });

        if (!updatedNotification) {
            res.status(404).json({ error: 'notification not found' });
            return;
        }

        res.status(201).json({ message: 'Update done successfully', info: updatedNotification });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
}

module.exports = adminNotificationController;
