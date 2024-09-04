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
  updateAdminUser,
} = require("../controllers/userController");
 
Router.post("/user/create", addUser);
Router.post("/user/login", login);
Router.post("/admin/login", login);
Router.get("/user/view", getUser);
Router.get("/user/viewbyid/:id", getUserById);
Router.put("/user/update/:id", updateUser);
Router.put("/user/updateuser/:id", updateAdminUser);
Router.delete("/user/delete/:id", deleteUser);
Router.put("/user/reset/:id", resetPassword);
 
module.exports = Router;
 