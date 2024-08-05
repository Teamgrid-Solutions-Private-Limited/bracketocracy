// season routes.js
const express = require("express");
const SC = require("../controllers/seasonController");
const router = express.Router();

router.post("/newseason", SC.addSeason);
router.get("/viewseason",SC.viewAll);
router.get("/viewseasonbyid/:id",SC.searchSeason);
router.delete("/deleteseason/:id",SC.seasonDelete);
router.put("/editseason/:id",SC.updateSeason);

module.exports = router;
