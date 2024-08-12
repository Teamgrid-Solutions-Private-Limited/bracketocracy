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

Router.post("/user/create", addUser);
Router.post("/user/login", login);
Router.get("/user/view", checkUser, getUser);
Router.get("/user/viewbyid/:id", getUserById);
Router.put("/user/update/:id", updateUser);
Router.delete("/user/delete/:id", deleteUser);

module.exports = Router;
 
