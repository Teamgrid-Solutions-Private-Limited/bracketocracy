const express = require("express");
const Router = express.Router();
const {
  addUser,
  login,
  getUser,
  getUserById,
  deleteUser,
  updateUser,
  resetPassword,
} = require("../controllers/userController");
const checkUser = require("../middleware/checkUser");
const checkAdmin = require("../middleware/checkAdmin");

Router.post("/user/create", addUser);
Router.post("/user/login", login);
Router.post("/admin/login", login);
Router.get("/user/view", checkUser, getUser);
Router.get("/user/viewbyid/:id", getUserById);
Router.put("/user/update/:id", updateUser);
Router.delete("/user/delete/:id", deleteUser);
Router.put("/user/reset/:id", resetPassword);

module.exports = Router;
