const Rank = require("../model/rankSchema");
const User = require("../model/userSchema");
 
 
class RankController {
  static calculateAndSaveRanks = async (seasonId) => {
    try {
      // Fetch users sorted by their scores in descending order
      const users = await User.find().sort({ score: -1 });
 
      let currentRank = 0;
      let currentScore = null; // To track the last score
 
      const rankUpdates = users.map((user, index) => {
        // If the user's score is different from the last score, increase the rank
        if (user.score !== currentScore) {
          currentRank += 1; // Move to the next rank if the score changes
        }
 
        // Update the current score for comparison in the next iteration
        currentScore = user.score;
 
        // Prepare the rank update for each user
        return {
          userId: user._id,
          seasonId: seasonId,
          rank: currentRank,
          points: user.score, // Points can be the user's score or other calculated values
          created: new Date(),
          updated: new Date(),
        };
      });
 
      // Clear existing ranks for the season
      await Rank.deleteMany({ seasonId });
 
      // Insert the new ranks into the Rank model
      await Rank.insertMany(rankUpdates);

      console.log("Ranks calculated and saved successfully");
    } catch (error) {
      console.error("Error calculating ranks:", error);
      throw new Error("Failed to calculate and save ranks.");
    }
  };
 
  // GET request to retrieve ranks for a specific season
  static getRanks = async (req, res) => {
    const { seasonId } = req.params;

    if (!seasonId) {
      return res.status(400).json({ message: "Season ID is required" });
    }

    try {
      // First, calculate and save ranks for the season
      await RankController.calculateAndSaveRanks(seasonId);
 
      // Fetch the calculated ranks
      const ranks = await Rank.find({ seasonId })
        .populate("userId", "userName email score")
        .sort({ rank: 1 });
 
      res.status(200).json(ranks);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving ranks" });
    }
  };
}
 
module.exports = RankController;
