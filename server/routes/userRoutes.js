const express = require("express");
const Router = express.Router();
const {
  addUser,
  login,
  getUser,
  getUserById,
  deleteUser,
  updateUser,
} = require("../controllers/userController");
const checkUser = require("../middleware/checkUser");

Router.post("/adduser", addUser);
Router.post("/loginuser", login);
Router.get("/viewuser", checkUser, getUser);
Router.get("/viewbyid/:id", getUserById);
Router.put("/updateid/:id", updateUser);
Router.delete("/delete/:id", deleteUser);

module.exports = Router;
 
