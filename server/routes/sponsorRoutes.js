const express = require('express');
const { addSponsor, deleteSponsor, updateSponsor, displayById, displayAll } = require('../controllers/sponsorController');

const router = express.Router();
router.post('/add', addSponsor);
router.get("/display", displayAll);
router.get("/display/:id", displayById);
router.delete("/delete/:id", deleteSponsor);
router.put("/update/:id", updateSponsor);

module.exports =router;
