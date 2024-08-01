const season = require("../model/seasonSchema");

class SeasonController {
  static addSeason = async (req, res) => {
    try {
      const { year } = req.body;
      if (!year) {
        return res.status(400).json({ error: "year  is required" });
      }
      const seasonData = new season({ year });
      const result = await seasonData.save();
      res
        .status(201)
        .json({ message: "season created successfully", data: result });
    } catch (error) {
      console.error(error);
      res.status(404).json({ error: "Internal Server Error" });
    }
  };
  static viewAll = async (req, res) => {
    try {
      const data = await season.find();
      res.status(200).json({ message: "view successful", info: data });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };
  static searchSeason = async (req, res) => {
    try {
      let seasonId = req.params.id;
      const result = await season.findById(seasonId);
      res.status(200).json({ seasondata: result });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };

  static seasonDelete = async (req, res) => {
    try {
      const data = req.params.id;
      const result = await season.findByIdAndDelete(data);
      res
        .status(200)
        .json({ message: "season deleted successfully", info: result });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };

  static updateSeason = async (req, res) => {
    try {
      const seasonId = req.params.id;
      const data = req.body;
      const seasonData = await season.findById(seasonId);
      seasonData.year = data.year;

      const update = await seasonData.save();
      res
        .status(200)
        .json({ message: "update done successfully", info: update });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };
}

module.exports = SeasonController;
