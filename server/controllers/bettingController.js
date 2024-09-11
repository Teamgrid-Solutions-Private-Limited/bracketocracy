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
      const { matchId, selectedWinner, seasonId, userId,betScore } = req.body;

      if (!matchId || !selectedWinner || !seasonId || !userId) {
        return res.status(400).json({ message: "All fields are required" });
      }
        const user = await User.findById(userId);
        if(!user)
        {
          return res.status(400).json({message:"user not found"});
        }
      if(betScore > user.score || betScore < 0)
      {
        return res.status(400).json({message:"bet should be greater than 0 and lesser than actual score"});
      }

      // Check if a bet already exists for the user and match
      const existingBet = await Betting.findOne({ matchId, userId }).exec();
      if (existingBet) {
        return res
          .status(400)
          .json({ message: "Bet already placed for this match" });
      }

      // Verify references
      const [match,season] = await Promise.all([
        Match.findById(matchId).exec(),
        // User.findById(userId).exec(),
        Season.findById(seasonId).exec(),
      ]);

      if (!match) return res.status(404).json({ message: "Match not found" });
      // if (!user) return res.status(404).json({ message: "User not found" });
      if (!season) return res.status(404).json({ message: "Season not found" });


      const bet = new Betting({ matchId, userId, selectedWinner, seasonId,betScore });
      const savedBet = await bet.save();

      res.status(201).json({ message: "Bet placed successfully", savedBet });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // Calculate points based on the round and match outcome
  static calculatePoints = async (roundSlug, selectedWinner) => {
    try {
      if (!selectedWinner) return 0;

      const team = await Team.findById(selectedWinner).exec();
      if (!team) return 0;

      const seedValue = team.seed || 0;
      const round = await Round.findOne({ slug: roundSlug }).exec();
      if (!round) return 0;

      let points = 0;
      switch (round.roundNumber) {
        case 0:
          points = 5;
          break;
        case 1:
          points = seedValue;
          break;
        case 2:
          points = seedValue * 2;
          break;
        case 3:
          points = seedValue * 3;
          break;
        case 4:
          points = 25;
          break;
        case 5:
          points = 50;
          break;
        case 6:
          points = 0;
          break;
        default:
          points = 0;
          break;
      }

      return points;
    } catch (error) {
      console.error("Error calculating points:", error.message);
      return 0;
    }
  };

  static updateBettingResults = async (matchId) => {
    try {
      const match = await Match.findById(matchId)
        .populate("decidedWinner")
        .exec();
      if (!match) {
        console.error("Match not found");
        return;
      }

      const decidedWinner = match.decidedWinner;
      const roundSlug = match.roundSlug;

      const bets = await Betting.find({ matchId })
        .populate("userId")
        .populate("selectedWinner")
        .exec();

      await Promise.all(
        bets.map(async (bet) => {
          const { selectedWinner, userId, score,betScore } = bet; // i need to find betting bracketscore
          const user = await User.findById(userId).exec();

          if (!user) {
            console.error("User not found for ID:", userId);
            return;
          }

          if (!selectedWinner) {
            console.error("Selected winner not found for bet ID:", bet._id);
            return;
          }

          let updatedScore = user.score;
          let bracketScore = betScore;
          

          if (roundSlug === "round-6") {
            if (selectedWinner.toString() === decidedWinner.toString()) {
              updatedScore += bracketScore * 2; // Double the score
            } else{
              updatedScore -= bracketScore;
            }
          } else {
            const points = await bettingController.calculatePoints(
              roundSlug,
              selectedWinner
            );
            if (selectedWinner.toString() === decidedWinner.toString()) {
              updatedScore += points; // Increase score based on points
            }
          }


          await User.findByIdAndUpdate(
            userId,
            { score: updatedScore },
            { new: true }
          ).exec(); // Update user score
        })
      );
    } catch (error) {
      console.error("Error updating betting results:", error.message);
    }
  };

  // Handle end of match
  static handleMatchEnd = async (req) => {
    try {
      const { matchId } = req.params;
      if (!matchId) {
        return res.status(400).json({ message: "Match ID is required" });
      }

      await bettingController.updateBettingResults(matchId);
      console.log(`Handling end of match with ID: ${matchId}`);
      // res.status(200).json({ message: "Betting results updated successfully" });
    } catch (error) {
      // res.status(500).json({ error: "Internal Server Error" });
      console.error("Error handling match end:", error);
      throw new Error("Error handling match end");
    }
  };

  // Get user bets
  static getUserBets = async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const bets = await Betting.find({ userId })
        .populate("matchId")
        .populate("selectedWinner")
        .populate("seasonId");

      res.status(200).json(bets);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  static updateBet = async (req, res) => {
    try {
      const { id } = req.params;
      const update = req.body;


      const updatedBet = await Betting.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true }
      );

      if (!updatedBet) {
        res.status(404).json({ error: "Bet not found" });
        return;
      }

      res
        .status(201)
        .json({ message: "Update done successfully", info: updatedBet });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  static deleteBet = async (req, res) => {
    try {
      const { id } = req.params.id;
      const deleteData = await Betting.findByIdAndDelete(id);
      res.status(200).json({ message: "deleted succesfully", info: deleteData });


    } catch (error) { res.status(500).json({ message: "delete unsuccessfull", error: error.message }) }
  }
}

module.exports = bettingController;
