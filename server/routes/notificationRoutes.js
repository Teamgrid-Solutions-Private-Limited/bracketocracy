const express = require("express");
const NC = require("../controllers/notificationController");

const Router = express.Router();

Router.post("/addnotification",NC.createNotification);
//Router.get("/getrole", getRoles);

module.exports = Router;
 
