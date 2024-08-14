const express = require("express");
const {
  createNotification,
  getNotifications,
} = require("../controllers/notificationController");

const Router = express.Router();

Router.post("/addnotification", createNotification);
Router.get("/getnotification", getNotifications);

module.exports = Router;
