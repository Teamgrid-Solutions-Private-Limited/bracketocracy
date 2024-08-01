const express = require("express");
const IC = require("../controllers/InvitationController");

const Router = express.Router();

Router.post("/invite/:leagueId",IC.addInvitation); // added by league id 
Router.get("/view",IC.showAll);
Router.delete("/delete/:id",IC.deleteInvite);
// Router.get("/viewby/:id", searchleague); // search by league if

module.exports = Router;
 