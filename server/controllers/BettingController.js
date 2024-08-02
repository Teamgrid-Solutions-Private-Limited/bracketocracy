const Betting = require("../model/bettingSchema");
const Match = require("../model/matchSchema");
const Team = require("../model/teamSchema");
const Season = require("../model/seasonSchema");

class bettingController {
  static createBetting = async (req, res) => {
    try {
      const { matchId, userId, selectedWinner, seasonId, score, status } =
        req.body;

      // Validate required fields
      if (!matchId || !userId || !selectedWinner || !seasonId) {
        return res
          .status(400)
          .json({ error: "Please provide all required fields" });
      }

      // Check if match exists
      const match = await Match.findById(matchId);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      // Check if team exists
      const team = await Team.findById(selectedWinner);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      // Check if season exists
      const season = await Season.findById(seasonId);
      if (!season) {
        return res.status(404).json({ error: "Season not found" });
      }

      // Check if match is part of the season
      if (!match.seasonId.equals(seasonId)) {
        return res
          .status(400)
          .json({ error: "Match is not part of the season" });
      }

      // Create new betting document
      const betting = new Betting({
        matchId,
        userId,
        selectedWinner,
        seasonId,
        score: score || 0, // default score to 0 if not provided
        status: status || 0, // default status to 0 if not provided
      });

      // Validate betting document
      const error = betting.validateSync();
      if (error) {
        return res.status(400).json({ error: "Invalid betting data" });
      }

      // Save betting document
      await betting.save();

      res.json({ message: "Betting created successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  static updateBetting = async (req, res) => {
    try {
      const id = req.params.id;
      const { score, status } = req.body;

      // Validate required fields
      if (!id) {
        return res.status(400).json({ error: "Please provide the betting ID" });
      }

      // Check if betting exists
      const betting = await Betting.findById(id);
      if (!betting) {
        return res.status(404).json({ error: "Betting not found" });
      }

      // Update betting document
      if (score !== undefined) {
        betting.score = score;
      }
      if (status !== undefined) {
        betting.status = status;
      }

      // Validate betting document
      const error = betting.validateSync();
      if (error) {
        return res.status(400).json({ error: "Invalid betting data" });
      }

      // Save betting document
      await betting.save();

      res.json({ message: "Betting updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static getAllBetting = async (req, res) => {
    try {
      const bettings = await Betting.find()
        .populate("matchId", "name")
        .populate("userId", "username")
        .populate("selectedWinner", "name")
        .populate("seasonId", "name");
      res.json(bettings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static getAllBettingById = async (req, res) => {
    try {
      const id = req.params.id;

      // Check if betting exists
      const betting = await Betting.findById(id)
        .populate("matchId", "name")
        .populate("userId", "username")
        .populate("selectedWinner", "name")
        .populate("seasonId", "name");
      if (!betting) {
        return res.status(404).json({ error: "Betting not found" });
      }

      res.json(betting);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static deleteBetting = async (req, res) => {
    try {
      const id = req.params.id;

      // Check if betting exists
      const betting = await Betting.findById(id);
      if (!betting) {
        return res.status(404).json({ error: "Betting not found" });
      }

      // Delete betting document
      await betting.remove();

      res.json({ message: "Betting deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

module.exports = bettingController;
