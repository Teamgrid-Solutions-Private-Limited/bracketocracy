const Rank = require("../model/rankSchema");
const User = require("../model/userSchema");
const Season = require("../model/seasonSchema");
const mongoose = require("mongoose");
 
 
class RankController {
  // Method to calculate and save ranks with logic for handling ties
  static calculateAndSaveRanks = async (seasonId) => {
    try {
      // Fetch users and their scores
      const users = await User.find().sort({ score: -1 });
 
      let currentRank = 1;
      let previousScore = null;
 
      const rankUpdates = users.map((user, index) => {
        if (previousScore !== null && user.score < previousScore) {
          currentRank = index + 1;
        }
 
        previousScore = user.score;
 
        return {
          userId: user._id,
          seasonId,
          rank: currentRank,
          points: user.score, // Points can be directly the score or any computed value
          achievedAt: new Date(),
        };
      });
 
      // Clear previous ranks for the season
      await Rank.deleteMany({ seasonId });
 
      // Save new ranks
      await Rank.insertMany(rankUpdates);
 
      console.log("Ranks calculated and saved successfully");
    } catch (error) {
      console.error("Error calculating ranks:", error);
      throw new Error("Failed to calculate and save ranks.");
    }
  };
 
  // GET request to retrieve ranks for a specific season and include scores in the response
  static getRanks = async (req, res) => {
    const { seasonId } = req.params;
 
    if (!seasonId) {
      return res.status(400).json({ message: "Season ID is required" });
    }
 
    try {
      // Calculate and save ranks before retrieving them
      await RankController.calculateAndSaveRanks(seasonId);
 
      // Retrieve the ranks after calculation and include the score
      const ranks = await Rank.find({ seasonId })
        .populate("userId", "userName email score")
        .sort({ rank: 1 });
 
      const ranksWithScores = ranks.map(rank => ({
        ...rank.toObject(),
        score: rank.points, // Add score field from the points value
      }));
 
      res.status(200).json(ranksWithScores);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving ranks" });
    }
  };
}
 
module.exports = RankController;
 