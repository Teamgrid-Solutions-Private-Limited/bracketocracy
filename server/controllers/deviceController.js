const Device = require("../model/deviceInformationSchema");

exports.registerDevice = async (req, res) => {
  const { userId, deviceToken, deviceInfo } = req.body;

  try {
    const newDevice = new Device({ userId, deviceToken, deviceInfo });
    await newDevice.save();
    res.status(201).json({ message: "Device registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering device", error });
  }
};

exports.getDevices = async (req, res) => {
  try {
    const devices = await Device.find().populate("userId", "username"); // Assuming a User model
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching devices", error });
  }
};
