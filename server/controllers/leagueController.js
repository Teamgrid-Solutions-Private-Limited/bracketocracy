const League = require("../model/leagueSchema");
const User = require("../model/userSchema");

class leagueController {
  static addLeague = async (req, res) => {
    const { title, description, userId } = req.body;
    if (!title || !description || !userId) {
      return res.status(400).json({
        error: "All fields (title, description, userId) are required",
      });
    }
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const data = await new League({ title, description, userId }).save();
      res
        .status(201)
        .json({ message: "League created successfully", info: data });
    } catch (err) {
      res
        .status(500)
        .json({ error: "An unexpected error occurred", details: err.message });
    }
  };

  static viewAll = async (req, res) => {
    try {
      const data = await League.find();
      res.status(201).json({ message: "view successful", info: data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  static searchLeague = async (req, res) => {
    try {
      let leagueId = req.params.id;
      const result = await League.findById(leagueId);
      res.status(201).json({ data: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  static leagueDelete = async (req, res) => {
    try {
      const data = req.params.id;
      const result = await League.findByIdAndDelete(data);
      res
        .status(201)
        .json({ message: "league deleted successfully", info: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  static updateLeague = async (req, res) => {
    try {
      const { id } = req.params;
      const update = req.body;

      // Find the league by ID and update its data
      const updatedLeague = await League.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true }
      );

      if (!updatedLeague) {
        res.status(404).json({ error: "League not found" });
        return;
      }

      res
        .status(201)
        .json({ message: "Update done successfully", info: updatedLeague });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}

module.exports = leagueController;
