const express = require('express');
const router = express.Router();
const { getDeviceInfoByUserId, createDeviceInfo }= require("../controllers/deviceinfoController");

 
router.post('/deviceinfo/create',  createDeviceInfo);
router.get('/deviceinfo/user/:userId',  getDeviceInfoByUserId);

module.exports = router;
