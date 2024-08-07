const Betting = require("../model/bettingSchema");
const Match = require("../model/matchSchema");
const Team = require("../model/teamSchema");
const Season = require("../model/seasonSchema");
const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
class bettingController {
  // Score update job
  static updateScoreJob = async (
    bettingId,
    matchId,
    seasonId,
    selectedWinner
  ) => {
    try {
      // Retrieve betting document
      const betting = await Betting.findById(bettingId);
      if (!betting) {
        console.error(`Betting document not found: ${bettingId}`);
        return;
      }

      // Calculate score based on round and selected winner
      let score;
      const round = await determineCurrentRound(matchId, seasonId);
      if (round === 0) {
        score = 5; // play-in round
      } else if (round === 1) {
        score = getSeedValue(match, selectedWinner); // round 1
      } else if (round === 2) {
        score = getSeedValue(match, selectedWinner) * 2; // round 2
      } else if (round === 3) {
        score = getSeedValue(match, selectedWinner) * 3; // round 3
      } else if (round === 4) {
        score = 25; // round 4
      } else if (round === 5) {
        score = 50; // round 5
      } else if (round === 6) {
        // round 6, bet all points (not implemented yet)
        score = 0;
      }

      // Update betting document with calculated score
      betting.score = score;
      await betting.save();

      // Update user's points balance
      const user = await User.findById(betting.userId);
      user.pointsBalance += score;
      await user.save();
    } catch (error) {
      console.error(error);
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
