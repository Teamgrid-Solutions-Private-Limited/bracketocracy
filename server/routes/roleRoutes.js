const express = require("express");
const { createRole, getRoles } = require("../controllers/roleController");

const Router = express.Router();

Router.post("/addrole", createRole);
Router.get("/getrole", getRoles);

module.exports = Router;
 
