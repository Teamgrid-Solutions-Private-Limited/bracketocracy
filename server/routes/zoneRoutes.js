// routes.js
const express = require("express");
const {
  addZone,
  viewAll,
  zoneDelete,
  updateZone,
  searchZone,
  searchZoneBySlug,
} = require("../controllers/zoneController");
const router = express.Router();

router.post("/newzone", addZone);
router.get("/viewzone", viewAll);
router.delete("/deletezone/:id", zoneDelete);
router.put("/editzone/:id", updateZone);
router.get("/viewzonebyid/:id", searchZone);
router.get("/viewzonebyslug/:slug", searchZoneBySlug);

module.exports = router;
