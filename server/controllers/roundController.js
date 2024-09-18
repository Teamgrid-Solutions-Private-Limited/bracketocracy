const Round = require("../model/roundSchema");
const Season = require("../model/seasonSchema");
const Match = require("../model/matchSchema");
const Team = require("../model/teamSchema");
const slugify = require("slugify");
const { createMatch } = require("../services/matchService");

class roundController {
  // Add a new round (as before)
  static addRound = async (req, res) => {
    try {
      const { name, playDate, biddingEndDate, seasonId, roundNumber } =
        req.body;

      if (!name || !playDate || !biddingEndDate || !seasonId || !roundNumber) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const now = new Date();
      const playDateObj = new Date(playDate);
      const biddingEndDateObj = new Date(biddingEndDate);

      if (isNaN(playDateObj.getTime()) || isNaN(biddingEndDateObj.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      if (playDateObj < now || biddingEndDateObj < now) {
        return res.status(400).json({
          error: "Play date and bidding end date must be in the future",
        });
      }

      const season = await Season.findById(seasonId);
      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }

      const slug = slugify(name, { lower: true });
      const round = new Round({
        name,
        slug,
        playDate: playDateObj,
        biddingEndDate: biddingEndDateObj,
        seasonId,
        roundNumber,
      });

      const result = await round.save();
      return res
        .status(201)
        .json({ message: "Round created successfully", data: result });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // View all rounds (as before)
  static viewRound = async (req, res) => {
    try {
      const roundList = await Round.find().exec();
      res.json(roundList);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error fetching rounds", error: error.message });
    }
  };

  // Delete a round by ID (as before)
  static deleteRound = async (req, res) => {
    try {
      const roundId = req.params.id;
      if (!roundId) {
        return res.status(400).json({ message: "Round ID is required" });
      }

      const round = await Round.deleteOne({ _id: roundId });
      if (round.deletedCount === 0) {
        return res.status(404).json({ message: "Round not found" });
      }

      res.json({ message: "Round deleted successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error deleting round", error: error.message });
    }
  };

  // Update a round by ID (as before)
  static updateRound = async (req, res) => {
    try {
      const roundId = req.params.id;
      const data = req.body;
      const roundData = await Round.findById(roundId);
      if (!roundData) {
        return res.status(404).json({ message: "Round not found" });
      }

      roundData.name = data.name;
      roundData.playDate = new Date(data.playDate);
      roundData.biddingEndDate = new Date(data.biddingEndDate);

      const update = await roundData.save();
      res
        .status(200)
        .json({ message: "Update done successfully", info: update });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating round" });
    }
  };

  static searchRoundBySlug = async (req, res) => {
    try {
      // Extract slug from URL params
      const slug = req.params.slug;

      // Search for a round with the given slug
      const round = await Round.findOne({ slug });

      // If no round is found, return a 404 error
      if (!round) {
        return res.status(404).json({ message: "Round not found" });
      }

      // Return the round data
      return res.status(200).json(round);
    } catch (error) {
      // Handle any errors that occur during the search
      console.error("Error searching round by slug:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  static async completeRoundAndCreateNext(req, res) {
    try {
      const roundId = req.params.id; // Extract round ID from the request
      // Step 1: Fetch the current round and matches
      const currentRound = await Round.findById(roundId);
      if (!currentRound) {
        return res.status(404).json({ message: "Round not found" });
      }

      const matches = await Match.find({ roundSlug: currentRound.slug });

      // Step 2: Check if all matches in this round have a winner
      let winners = [];
      matches.forEach((match) => {
        if (match.winner) {
          winners.push(match.winner);
        }
      });

      // Step 3: Ensure all matches are completed
      if (winners.length !== matches.length) {
        return res
          .status(400)
          .json({ message: "Not all matches are completed yet." });
      }

      // Step 4: Ensure there are enough winners for the next round
      if (winners.length < 2) {
        return res
          .status(400)
          .json({ message: "Not enough winners for the next round." });
      }

      // Step 5: Create the next round (if not the final round)
      let nextRound = null;
      if (currentRound.roundNumber < 6) {
        const nextPlayDate = new Date(); // You should calculate the next play date
        const nextBiddingEndDate = new Date(); // You should calculate the next bidding end date

        nextRound = await Round.create({
          name: `Round ${currentRound.roundNumber + 1}`,
          slug: `round-${currentRound.roundNumber + 1}`,
          playDate: nextPlayDate,
          biddingEndDate: nextBiddingEndDate,
          seasonId: currentRound.seasonId,
          roundNumber: currentRound.roundNumber + 1,
          totalMatch: Math.floor(winners.length / 2),
          status: "upcoming",
        });

        // Step 6: Create matches for the next round
        let nextRoundMatches = await roundController.createNextRoundMatches(
          winners,
          nextRound.slug,
          currentRound.seasonId
        );

        return res.status(200).json({
          message: "Round completed and next round created successfully",
          currentRound,
          nextRound,
          nextRoundMatches,
        });
      } else {
        // Step 7: Handle the final round (Championship)
        const championshipMatch = await createMatch({
          team1: winners[0],
          team2: winners[1],
          score1: 0,
          score2: 0,
          roundSlug: "championship",
          seasonId: currentRound.seasonId,
          matchStatus: "upcoming",
        });

        return res.status(200).json({
          message: "Championship round created successfully",
          championshipMatch,
        });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Error completing round and creating the next round" });
    }
  }

  //Helper function to create next round matches
  static createNextRoundMatches = async (winners, nextRoundSlug, seasonId) => {
    try {
      const matches = [];

      // Handle the case if the number of winners is odd
      if (winners.length % 2 !== 0) {
        const byeTeam = winners.pop(); // Give the last team a bye
        console.log(`Team ${byeTeam} gets a bye to the next round.`);
      }

      for (let i = 0; i < winners.length; i += 2) {
        const match = await createMatch({
          team1: winners[i],
          team2: winners[i + 1],
          score1: 0,
          score2: 0,
          roundSlug: nextRoundSlug,
          seasonId: seasonId,
          matchStatus: "upcoming",
        });
        matches.push(match);
      }

      return matches;
    } catch (error) {
      console.error("Error creating next round matches:", error);
      throw new Error("Failed to create next round matches");
    }
  };
}

module.exports = roundController;
