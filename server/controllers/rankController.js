//const { User, Rank } = require("../model/"); // Adjust the path as necessary
const Rank = require("../model/rankSchema");
const User = require("../model/userSchema");
const Season = require("../model/seasonSchema");
const mongoose = require("mongoose");
// Function to calculate and save ranks
const calculateAndSaveRanks = async (seasonId) => {
  try {
    // Fetch users and their scores
    const users = await User.find().sort({ score: -1 }); // Sort users by score in descending order

    // Assign ranks based on scores
    const rankUpdates = users.map((user, index) => ({
      userId: user._id,
      seasonId,
      rank: index + 1,
      points: user.score, // Points can be directly the score or any computed value
      achievedAt: new Date(),
    }));

    // Clear previous ranks for the season
    await Rank.deleteMany({ seasonId });

    // Save new ranks
    await Rank.insertMany(rankUpdates);

    console.log("Ranks calculated and saved successfully");
  } catch (error) {
    console.error("Error calculating ranks:", error);
  }
};

class RankController {
  // POST request to trigger rank calculation for a specific season
  static savedRank = async (req, res) => {
    const { seasonId } = req.body;

    if (!seasonId) {
      return res.status(400).json({ message: "Season ID is required" });
    }

    try {
      await calculateAndSaveRanks(seasonId);
      res
        .status(200)
        .json({ message: "Ranks calculated and saved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error calculating ranks" });
    }
  };

  static getRank = async (req, res) => {
    try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      console.log(`Fetching rank with ID: ${id}`);
      const rankkk = await Rank.findById(id)
        .populate("userId")
        .populate("seasonId")
        .exec();

      console.log(rankkk);

      if (!rankkk) {
        return res.status(404).json({ message: "Rank not found" });
      }

      res.status(200).json(rankkk);
    } catch (error) {
      console.error("Error fetching rank:", error);
      res.status(500).json({ message: "Error fetching rank" });
    }
  };
}
module.exports = RankController;
