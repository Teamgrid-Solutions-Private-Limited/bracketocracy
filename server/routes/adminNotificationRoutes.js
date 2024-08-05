const express = require("express");
const { createNotification, viewAll, updatedNotification, notificationDelete } = require("../controllers/adminNotificationController");

const Router = express.Router();

Router.post("/addnotification",createNotification);
Router.get("/showall",viewAll);
Router.put("/update",updatedNotification);
Router.delete("/delete",notificationDelete);

module.exports = Router;
 