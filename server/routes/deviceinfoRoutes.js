const express = require('express');
const router = express.Router();
const { getDeviceInfoByUserId, createDeviceInfo }= require("../controllers/deviceinfoController");

 
router.post('/device-info',  createDeviceInfo);
router.get('/device-info/user/:userId',  getDeviceInfoByUserId);

module.exports = router;
