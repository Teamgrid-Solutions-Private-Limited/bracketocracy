const Betting = require("../model/bettingSchema");
const Match = require("../model/matchSchema");
const User = require("../model/userSchema");
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
      if (!selectedWinner) {
        res
          .status(404)
          .json({ message: "Selected winner ID is null or undefined" });
        return 0;
      }

      const team = await Team.findById(selectedWinner).exec();

      if (!team) {
        res.status(404).json({ message: "Team not found", selectedWinner });
        return 0;
      }

      const seedValue = team.seed || 0; // Get seed value from the team

      const round = await Round.findOne({ slug: roundSlug }).exec();

      if (!round) {
        res.status(404).json({ message: "Round not found" });
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
          points = 0; // Change to 0 instead of null
          break;
        default:
          points = 0;
          break;
      }

      return points;
    } catch (error) {
      res.status(404).json({ message: error.message });
      return 0;
    }
  };

  // Update the score based on match outcome
  static updateBettingResults = async (matchId) => {
    try {
      const match = await Match.findById(matchId)
        .populate("decidedWinner")
        .exec();

      if (!match) {
        res.status(404).json({ message: "Match not found" });
        return;
      }

      const decidedWinner = match.decidedWinner;

      const roundSlug = match.roundSlug; // Assuming the round slug is available in the match
      const bets = await Betting.find({ matchId })
        .populate("userId")
        .populate("selectedWinner")
        .exec();

      for (const bet of bets) {
        const { selectedWinner, userId, score } = bet;
        const user = await User.findById(userId).exec();

        if (!user) {
          res.status(404).json({ message: "User not found" });
          continue;
        }

        if (!selectedWinner) {
          res.status(404).json({ message: "Selected winner not found" });
          continue;
        }

        let updatedScore = score; // Use the initial score from the bet

        // Calculate points based on round and selected winner
        const points = await bettingController.calculatePoints(
          roundSlug,
          selectedWinner
        );

        if (roundSlug === "round6") {
          // Special case for Round 6: the user bets all their points
          if (
            selectedWinner &&
            decidedWinner &&
            selectedWinner.toString() === decidedWinner.toString()
          ) {
            // User wins in Round 6
            updatedScore = score + score; // Double the score (i.e., 10 + 10 = 20)
          } else {
            // User loses in Round 6
            updatedScore = score; // User retains their points (no change in score)
          }
        } else if (
          selectedWinner &&
          decidedWinner &&
          selectedWinner.toString() === decidedWinner.toString()
        ) {
          // User wins in other rounds
          if (points !== null) {
            updatedScore += points; // Increase score based on points calculated
          }
        }
        // else {
        //   // User loses in other rounds
        //   // No change in score if user loses
        //   // updatedScore remains the same
        // }

        // Update the bet with the new score
        await Betting.findByIdAndUpdate(
          bet._id,
          { score: updatedScore },
          { new: true }
        ).exec();
      }
    } catch (error) {
      res
        .status(404)
        .json({
          message: "Error updating betting results",
          error: error.message,
        });
    }
  };
  // Handle end of match
  static handleMatchEnd = async (req, res) => {
    try {
      const { matchId } = req.params;
      console.log(matchId);
      if (!matchId) {
        return res.status(400).json({ message: "Match ID is required" });
      }

      await bettingController.updateBettingResults(matchId);
      res.status(200).json({ message: "Betting results updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Get user bets
  static getUserBets = async (req, res) => {
    try {
      const userId = req.params; // Assuming user ID is available from authentication middleware
      const bets = await Betting.find({ userId })
        .populate("matchId")
        .populate("selectedWinner")
        .populate("seasonId");

      res.status(200).json(bets);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

module.exports = bettingController;
