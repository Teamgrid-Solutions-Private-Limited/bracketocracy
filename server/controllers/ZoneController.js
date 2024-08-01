// zones.js schema
const Zone = require("../model/zoneSchema");

const slugify = require("slugify");

class ZoneController {
  static addZone = async (req, res) => {
    try {
      const { zoneName } = req.body;
      if (!zoneName) {
        console.log(zoneName);
        return res.status(400).json({ error: "Name  is required" });
      }
      const slug = slugify(zoneName);
      const zone = new Zone({ zoneName, slug });
      const result = await zone.save();
      res
        .status(201)
        .json({ message: "Zone created successfully", data: result });
    } catch (error) {
      console.error(error);
      res.status(404).json({ error: "Internal Server Error" });
    }
  };

  static viewAll = async (req, res) => {
    try {
      const data = await Zone.find();
      res.status(200).json({ message: "view successful", info: data });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };

  static searchZone = async (req, res) => {
    try {
      let zoneId = req.params.id;
      const result = await Zone.findById(zoneId);
      res.status(200).json({ data: result });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };

  static zoneDelete = async (req, res) => {
    try {
      const data = req.params.id;
      const result = await Zone.findByIdAndDelete(data);
      res
        .status(200)
        .json({ message: "zone deleted successfully", info: result });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };

  static updateZone = async (req, res) => {
    try {
      const zoneId = req.params.id;
      const data = req.body;
      const zoneData = await Zone.findById(zoneId);
      zoneData.zoneName = data.zoneName;
      // zonedata.slug = data.slug;
      zoneData.slug = slugify(data.zoneName);
      const update = await zoneData.save();
      res
        .status(200)
        .json({ message: "update done successfully", info: update });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };

  static searchZoneBySlug = async (req, res) => {
    try {
      const slug = req.params.slug;
      const zone = await Zone.findOne({ slug });
      if (!zone) {
        res.status(404).send({ message: "Zone not found" });
      } else {
        res.send(zone);
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Error fetching zone" });
    }
  };
}

module.exports = ZoneController;
