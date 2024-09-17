// const Round = require("../model/roundSchema");
// const Season = require("../model/seasonSchema");
// const slugify = require("slugify");

// class roundController {
//   static addRound = async (req, res) => {
//     try {
//       const {
//         name,
//         playDate,
//         biddingEndDate,
//         // totalMatch,
//         seasonId,
//         roundNumber,
//       } = req.body;

//       // Validate required fields
//       if (
//         !name ||
//         !playDate ||
//         !biddingEndDate ||
//         // !totalMatch ||
//         !seasonId ||
//         !roundNumber
//       ) {
//         return res.status(400).json({ error: "All fields are required" });
//       }

//       // Validate and parse date fields
//       const now = new Date();
//       const playDateObj = new Date(playDate);
//       const biddingEndDateObj = new Date(biddingEndDate);

//       // Check if dates are valid
//       if (isNaN(playDateObj.getTime()) || isNaN(biddingEndDateObj.getTime())) {
//         return res.status(400).json({ error: "Invalid date format" });
//       }

//       if (playDateObj < now || biddingEndDateObj < now) {
//         return res.status(400).json({
//           error: "Play date and bidding end date must be in the future",
//         });
//       }

//       // Validate totalMatch
//       // if (totalMatch <= 0) {
//       //   return res
//       //     .status(400)
//       //     .json({ error: "Total match must be greater than 0" });
//       // }

//       // Check if season exists
//       const season = await Season.findById(seasonId);
//       if (!season) {
//         return res.status(404).json({ message: "Season not found" });
//       }

//       // Create and save the round
//       const slug = slugify(name, { lower: true });
//       const round = new Round({
//         name,
//         slug,
//         playDate: playDateObj,
//         biddingEndDate: biddingEndDateObj,
//         // totalMatch,
//         seasonId,
//         roundNumber,
//       });

//       const result = await round.save();
//       return res
//         .status(201)
//         .json({ message: "Round created successfully", data: result });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }
//   };
//   static viewRound = async (req, res) => {
//     try {
//       const roundList = await Round.find().exec();
//       res.json(roundList);
//     } catch (error) {
//       console.log(error);
//       res
//         .status(500)
//         .json({ message: "Error fetching roles", error: error.message });
//     }
//   };

//   static deleteRound = async (req, res) => {
//     try {
//       const roundId = req.params.id;
//       if (!roundId) {
//         return res.status(400).json({ message: "round ID is required" });
//       }

//       const user = await Round.deleteOne({ _id: roundId });
//       if (user.deletedCount === 0) {
//         return res.status(404).json({ message: "round not found" });
//       }

//       res.json({ message: "round deleted successfully" });
//     } catch (error) {
//       console.error(error);
//       res
//         .status(500)
//         .json({ message: "Error deleting round", error: error.message });
//     }
//   };

//   static updateRound = async (req, res) => {
//     try {
//       const roundId = req.params.id;
//       const data = req.body;
//       const roundData = await Round.findById(roundId);
//       roundData.name = data.name;
//       // roundData.totalMatch = data.totalMatch;
//       roundData.playDate = data.playDate;
//       roundData.biddingEndDate = data.biddingEndDate;

//       const update = await roundData.save();
//       res
//         .status(200)
//         .json({ message: "update done successfully", info: update });
//     } catch (err) {
//       res.status(404).json({ error: err.message });
//     }
//   };

//   // static updateRound = async (req, res) => {
//   //   try {
//   //     const roundId = req.params.id;
//   //     const data = req.body;
//   //     const roundData = await Round.findById(roundId);
//   //     roundData.name = data.name;
//   //     roundData.totalMatch = data.totalMatch;

//   //     const update = await roundData.save();
//   //     res
//   //       .status(200)
//   //       .json({ message: "update done successfully", info: update });
//   //   } catch (err) {
//   //     res.status(404).json({ error: err.message });
//   //   }
//   // };

//   static searchRoundBySlug = async (req, res) => {
//     try {
//       const slug = req.params.slug;
//       const round = await Round.findOne({ slug });
//       if (!round) {
//         res.status(404).send({ message: "round not found" });
//       } else {
//         res.send(round);
//       }
//     } catch (err) {
//       console.error(err);
//       res.status(500).send({ message: "Error fetching round" });
//     }
//   };
//   static searchRoundById = async (req, res) => {
//     try {
//       let roundId = req.params.id;
//       const result = await Round.findById(roundId);
//       res.status(200).json({ data: result });
//     } catch (err) {
//       res.status(404).json({ error: err.message });
//     }
//   };
// }

// module.exports = roundController;

const Round = require("../model/roundSchema");
const Season = require("../model/seasonSchema");
const Match = require("../model/matchSchema"); // Assuming Match schema exists
const Team = require("../model/teamSchema"); // Assuming Team schema exists
//const { createMatch } = require("./matchController"); // Import the shared createMatch function
const slugify = require("slugify");
const { createMatch } = require("../services/matchService");

class roundController {
  // Add a new round
  static addRound = async (req, res) => {
    try {
      const { name, playDate, biddingEndDate, seasonId, roundNumber } =
        req.body;

      // Validate required fields
      if (!name || !playDate || !biddingEndDate || !seasonId || !roundNumber) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Parse date fields
      const now = new Date();
      const playDateObj = new Date(playDate);
      const biddingEndDateObj = new Date(biddingEndDate);

      // Validate dates
      if (isNaN(playDateObj.getTime()) || isNaN(biddingEndDateObj.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      if (playDateObj < now || biddingEndDateObj < now) {
        return res.status(400).json({
          error: "Play date and bidding end date must be in the future",
        });
      }

      // Check if season exists
      const season = await Season.findById(seasonId);
      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }

      // Create and save the round
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

  // View all rounds
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

  // Delete a round by ID
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

  // Update a round by ID
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

  // Search for a round by slug
  static searchRoundBySlug = async (req, res) => {
    try {
      const slug = req.params.slug;
      const round = await Round.findOne({ slug });
      if (!round) {
        res.status(404).json({ message: "Round not found" });
      } else {
        res.json(round);
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error fetching round", error: error.message });
    }
  };

  // Search for a round by ID
  static searchRoundById = async (req, res) => {
    try {
      const roundId = req.params.id;
      const result = await Round.findById(roundId);
      if (!result) {
        return res.status(404).json({ message: "Round not found" });
      }
      res.status(200).json({ data: result });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error fetching round", error: error.message });
    }
  };

  // Main function to complete the current round and create the next round

  // Main function to complete the current round and create the next round
  static completeRoundAndCreateNext = async (req, res) => {
    try {
      const { roundId } = req.params;

      // Step 1: Find the current round by ID
      const round = await Round.findById(roundId);
      if (!round) {
        return res.status(404).json({ message: "Round not found" });
      }

      // Step 2: Check if all matches in the current round have a decided winner
      const matchesInRound = await Match.find({ roundSlug: round.slug });
      const undecidedMatches = matchesInRound.filter(
        (match) => !match.decidedWinner
      );

      if (undecidedMatches.length > 0) {
        return res.status(400).json({
          message: "Not all matches in this round are completed yet.",
        });
      }

      // Step 3: Collect winners from the current round
      const roundWinners = matchesInRound
        .map((match) => match.decidedWinner)
        .filter(Boolean);

      // Log the winners for debugging
      console.log("Winners advancing to the next round:", roundWinners);

      if (roundWinners.length === 0) {
        return res
          .status(400)
          .json({ message: "No winners found for the round." });
      }

      // Mark the current round as completed
      round.completed = true;
      round.status = "completed";
      await round.save();

      // Step 4: Handle when there are two or fewer teams left (Finals)
      if (roundWinners.length <= 2) {
        if (roundWinners.length === 2) {
          const finalRoundSlug = slugify("Finals", { lower: true });

          // Check if the final round already exists
          const existingFinalRound = await Round.findOne({
            slug: finalRoundSlug,
            seasonId: round.seasonId,
          });

          if (existingFinalRound) {
            return res
              .status(400)
              .json({ message: "Final round already exists." });
          }

          // Create the final round
          const finalRound = new Round({
            name: "Finals",
            slug: finalRoundSlug,
            playDate: new Date(),
            biddingEndDate: new Date(
              new Date().setDate(new Date().getDate() - 1)
            ),
            seasonId: round.seasonId,
            roundNumber: round.roundNumber + 1,
            totalMatch: 1,
            status: "upcoming",
          });

          const createdFinalRound = await finalRound.save();

          const finalMatch = await createMatch(
            roundWinners[0],
            roundWinners[1],
            0,
            0,
            0,
            finalRound.slug,
            null,
            round.seasonId
          );

          return res.status(200).json({
            message: "Round completed and final match created successfully",
            currentRound: round,
            nextRound: createdFinalRound,
            finalMatch,
          });
        }

        if (roundWinners.length === 1) {
          // If only one winner, they automatically win the tournament
          return res.status(200).json({
            message: `Tournament winner: ${roundWinners[0]}`,
            currentRound: round,
          });
        }
      }

      // Step 5: Automatically create the next round if more than 2 teams are left
      const nextRoundNumber = round.roundNumber + 1;
      const nextRoundSlug = slugify(`Round ${nextRoundNumber}`, {
        lower: true,
      });

      // Check if the next round already exists
      const existingNextRound = await Round.findOne({
        slug: nextRoundSlug,
        seasonId: round.seasonId,
      });

      if (existingNextRound) {
        return res
          .status(400)
          .json({ message: `Round ${nextRoundNumber} already exists.` });
      }

      const newPlayDate = new Date();
      newPlayDate.setDate(newPlayDate.getDate() + 7);

      const newBiddingEndDate = new Date(newPlayDate);
      newBiddingEndDate.setDate(newPlayDate.getDate() - 1);

      const totalMatchesInNextRound = Math.floor(roundWinners.length / 2);

      const nextRound = new Round({
        name: `Round ${nextRoundNumber}`,
        slug: nextRoundSlug,
        playDate: newPlayDate,
        biddingEndDate: newBiddingEndDate,
        seasonId: round.seasonId,
        roundNumber: nextRoundNumber,
        totalMatch: totalMatchesInNextRound,
        status: "upcoming",
      });

      const createdNextRound = await nextRound.save();

      // Create matches for the next round
      const nextRoundMatches = await roundController.createNextRoundMatches(
        roundWinners,
        nextRoundSlug,
        round.seasonId
      );

      res.status(200).json({
        message: "Round completed and next round created successfully",
        currentRound: round,
        nextRound: createdNextRound,
        nextRoundMatches,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Error completing round and creating the next round" });
    }
  };

  // Helper function to create matches for the next round
  // Helper function to create matches for the next round
  static createNextRoundMatches = async (winners, nextRoundSlug, seasonId) => {
    try {
      const matches = [];

      // Handle case where only one team is left
      if (winners.length === 1) {
        const singleWinner = winners[0];
        console.log(`Only one team remains: ${singleWinner}.`);
        return []; // Handle separately or promote this team automatically
      }

      // Handle odd number of teams
      if (winners.length % 2 !== 0) {
        const byeTeam = winners.pop(); // Give the last team a bye
        console.log(`Team ${byeTeam} gets a bye to the next round.`);
      }

      // Loop through the remaining winners array in pairs
      for (let i = 0; i < winners.length; i += 2) {
        if (winners[i] && winners[i + 1]) {
          const match = await createMatch(
            winners[i],
            winners[i + 1],
            0,
            0,
            0,
            nextRoundSlug,
            null,
            seasonId
          );

          matches.push(match);
        } else {
          console.warn(
            "Not enough teams to create a match. Skipping this pair."
          );
        }
      }

      // Log created matches
      console.log("Created matches for the next round:", matches);

      return matches;
    } catch (error) {
      console.error("Error creating next round matches:", error);
      throw new Error("Failed to create next round matches");
    }
  };
}
module.exports = roundController;
