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
  
      // Validate that fields are present
      if (!matchId || !selectedWinner || !score === undefined || !seasonId) {
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
      
      res.status(500).json({ error:error.message});
    }
  };
  
  // Calculate points based on the round and match outcome
  static calculatePoints = async (roundSlug, selectedWinner) => {
    try {
      if (!selectedWinner) {
        console.error("Selected winner ID is null or undefined");
        return 0;
      }
  
      const team = await Team.findById(selectedWinner).exec();
  
      if (!team) {
        console.error("Team not found", selectedWinner);
        return 0;
      }
  
      const seedValue = team.seed || 0; // Get seed value from the team
  
      const round = await Round.findOne({ slug: roundSlug }).exec();
  
      if (!round) {
        console.error("Round not found");
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
      console.error("Error calculating points:", error.message);
      return 0;
    }
  };
  static updateBettingResults = async (matchId) => {
    try {
      const match = await Match.findById(matchId).populate("decidedWinner").exec();
  
      if (!match) {
        console.error("Match not found");
        return;
      }
  
      const decidedWinner = match.decidedWinner;
      const roundSlug = match.roundSlug;
      console.log(`Match Round Slug: ${roundSlug}`);
      
      if (roundSlug === "round6") {
        console.log("Processing Round 6");
      }
  
      const bets = await Betting.find({ matchId }).populate("userId").populate("selectedWinner").exec();
      
      for (const bet of bets) {
        const { selectedWinner, userId, score } = bet;
        const user = await User.findById(userId).exec();
  
        if (!user) {
          console.error("User not found for ID:", userId);
          continue;
        }
  
        if (!selectedWinner) {
          console.error("Selected winner not found for bet ID:", bet._id);
          continue;
        }
  
        let updatedScore = score;
        console.log(`Initial score for bet ID ${bet._id}: ${updatedScore}`);
  
        if (roundSlug === "round-6") {
          // Special case for Round 6: the user bets all their points
          console.log(`Evaluating Round 6 bet for ID ${bet._id}`);
          if (selectedWinner && decidedWinner && selectedWinner.toString() === decidedWinner.toString()) {
            // User wins in Round 6
            updatedScore = score + score; // Double the score
            console.log(`User won in Round 6, updated score: ${updatedScore}`);
          } else {
            // User loses in Round 6
            updatedScore = score; // No change in score
            console.log(`User lost in Round 6, score remains: ${updatedScore}`);
          }
        } else {
          // For other rounds, calculate points and update score
          const points = await bettingController.calculatePoints(roundSlug, selectedWinner);
          console.log(`Points calculated for bet ID ${bet._id}: ${points}`);
          
          if (selectedWinner && decidedWinner && selectedWinner.toString() === decidedWinner.toString()) {
            if (points !== null) {
              updatedScore += points; // Increase score based on points calculated
              console.log(`User won in round ${roundSlug}, updated score: ${updatedScore}`);
            }
          }
        }
  
        // Update the bet with the new score
        const updatedBet = await Betting.findByIdAndUpdate(bet._id, { score: updatedScore }, { new: true }).exec();
        if (!updatedBet) {
          console.error(`Failed to update bet with ID: ${bet._id}`);
        } else {
          console.log(`Bet updated with new score: ${updatedScore}`);
        }
      }
    } catch (error) {
      console.error("Error updating betting results:", error.message);
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
       
      res.status(500).json({ error:error.message });
    }
  };
}

module.exports = bettingController;
