const DeviceInfo = require('../model/deviceInformationSchema'); // Adjust the path as needed

class deviceinfoController {
   
  static  createDeviceInfo= async(req, res)=> {
    try {
      const { deviceType, deviceToken, userId } = req.body;

      if (!deviceType || !deviceToken || !userId) {
        return res.status(400).json({ message: 'Device type, token, and user ID are required' });
      }

      
      const existingDeviceInfo = await DeviceInfo.findOne({ userId }).exec();
      if (existingDeviceInfo) {
         
        existingDeviceInfo.deviceType = deviceType;
        existingDeviceInfo.deviceToken = deviceToken;
        existingDeviceInfo.updated = Date.now();
        const updatedDeviceInfo = await existingDeviceInfo.save();
        return res.status(200).json({ message: 'Device information updated successfully', updatedDeviceInfo });
      }

      // Create new device information
      const newDeviceInfo = new DeviceInfo({
        deviceType,
        deviceToken,
        userId,
      });

      const savedDeviceInfo = await newDeviceInfo.save();
      res.status(201).json({ message: 'Device information created successfully', savedDeviceInfo });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  
  static async getDeviceInfoByUserId(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const deviceInfo = await DeviceInfo.findOne({ userId }).exec();

      if (!deviceInfo) {
        return res.status(404).json({ message: 'No device information found for this user' });
      }

      res.status(200).json({
        deviceType: deviceInfo.deviceType,
        deviceToken: deviceInfo.deviceToken,
        created: deviceInfo.created,
        updated: deviceInfo.updated,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = deviceinfoController;
