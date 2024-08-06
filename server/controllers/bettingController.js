const Betting = require("../model/bettingSchema");
const Match = require("../model/matchSchema");
const User = require("../model/userSchema");
const Season = require("../model/seasonSchema");
const Round = require("../model/roundSchema");
const Team = require("../model/teamSchema"); // Ensure you have a Team model

class bettingController {
  // Place a bet
  static placeBet = async (req, res) => {
    try {
      const { matchId, selectedWinner, score, seasonId, userId } = req.body;
      // const userId = req.user.userId; // Assuming user ID is available from authentication middleware

      // Validate that fields are present
      if (!matchId || !selectedWinner || score === undefined || !seasonId) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Verify references
      const match = await Match.findById(matchId).exec();
      const user = await User.findById(userId).exec();
      const season = await Season.findById(seasonId).exec();

      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }

      // Create and save the bet
      const bet = new Betting({
        matchId,
        userId,
        selectedWinner,
        score,
        seasonId
      });

      const savedBet = await bet.save();

      // Respond with the saved bet
      res.status(201).json({ message: "Bet placed successfully", savedBet });
    } catch (error) {
      console.error("Error placing bet:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Calculate points based on the round and match outcome
  static calculatePoints = async (roundSlug, selectedWinnerId) => {
    try {
      // Fetch the team associated with the selectedWinner
      const team = await Team.findById(selectedWinnerId).exec();
      if (!team) {
        console.error("Team not found:", selectedWinnerId);
        return 0;
      }

      const seedValue = team.seed || 0; // Get seed value from the team

      const round = await Round.findOne({ slug: roundSlug }).exec();
      if (!round) {
        console.error("Round not found:", roundSlug);
        return 0;
      }

      let points = 0;

      switch (round.roundNumber) {
        case 0: // Pre-tournament round
          points = 5;
          break;
        case 1: // Round 1
          points = seedValue;
          break;
        case 2: // Round 2
          points = seedValue * 2;
          break;
        case 3: // Round 3
          points = seedValue * 3;
          break;
        case 4: // Round 4
          points = 25;
          break;
        case 5: // Round 5
          points = 50;
          break;
        case 6: // Round 6
          return null; // No fixed points, the user's entire score will be bet
        default:
          points = 0;
          break;
      }

      return points;
    } catch (error) {
      console.error("Error calculating points:", error);
      return 0;
    }
  };

  // Update the score based on match outcome
  static updateBettingResults = async (matchId) => {
    try {
      const match = await Match.findById(matchId).populate("decidedWinner").exec();
      if (!match) {
        console.error("Match not found:", matchId);
        return;
      }

      const decidedWinner = match.decidedWinner;
      const roundSlug = match.roundSlug; // Assuming the round slug is available in the match
      const bets = await Betting.find({ matchId }).populate("userId").populate("selectedWinner").exec();

      for (const bet of bets) {
        const { selectedWinner, score, userId } = bet;
        const user = await User.findById(userId).exec();

        if (!user) {
          console.error("User not found:", userId);
          continue;
        }

        let updatedScore = score;
        const points = await bettingController.calculatePoints(roundSlug, selectedWinner);

        if (roundSlug === "round6") {
          // Special case for Round 6: the user bets all their points
          updatedScore = user.score; // User bets all their points
        } else if (selectedWinner && decidedWinner && selectedWinner.toString() === decidedWinner.toString()) {
          // User wins
          if (points !== null) {
            updatedScore += points;
          }
        }
         

        // Update the bet with the new score
        await Betting.findByIdAndUpdate(bet._id, { score: updatedScore }, { new: true }).exec();
        // Also update the user's score
        await User.findByIdAndUpdate(userId, { score: updatedScore }, { new: true }).exec();
      }
    } catch (error) {
      console.error("Error updating betting results:", error);
    }
  };

  // Handle end of match
  static handleMatchEnd = async (req, res) => {
    try {
      const { matchId } = req.params;
      if (!matchId) {
        return res.status(400).json({ message: "Match ID is required" });
      }

      await bettingController.updateBettingResults(matchId);
      res.status(200).json({ message: "Betting results updated successfully" });
    } catch (error) {
      console.error("Error handling match end:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Get user bets
  static getUserBets = async (req, res) => {
    try {
      const userId = req.user.params; // Assuming user ID is available from authentication middleware
      const bets = await Betting.find({ userId })
        .populate("matchId")
        .populate("selectedWinner")
        .populate("seasonId");

      res.status(200).json(bets);
    } catch (error) {
      console.error("Error fetching user bets:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

module.exports = bettingController;
