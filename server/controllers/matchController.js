const Match = require("../model/matchSchema");
const Team = require("../model/teamSchema");
const Round = require("../model/roundSchema");
const Season = require("../model/seasonSchema");
const Zone = require("../model/zoneSchema");
const bettingController = require("./bettingController");
const roundController = require("./roundController");

class MatchController {
  static getNextRound = (currentRoundName) => {
    const roundOrder = [
      "play in match",
      "round 1",
      "round 2",
      "sweet 16",
      "elite 8",
      "final 4",
      "final (championship game)",
    ];

    const currentIndex = roundOrder.findIndex(
      (round) => round.toLowerCase() === currentRoundName.toLowerCase()
    );

    // Return the next round if it exists
    if (currentIndex !== -1 && currentIndex < roundOrder.length - 1) {
      return roundOrder[currentIndex + 1];
    }

    return null; // No next round
  };

  // Create matches for the next round using winners from the previous round
  static createNextRound = async (req, res) => {
    try {
      const { seasonId, currentRoundName } = req.body;
      console.log(
        `Creating next round matches for season: ${seasonId}, current round: ${currentRoundName}`
      );

      // Get the next round name
      const nextRoundName = this.getNextRound(currentRoundName);
      if (!nextRoundName) {
        return res.status(400).json({ message: "Invalid current round" });
      }

      const completedMatches = await Match.find({
        roundSlug: roundController.generateSlug(currentRoundName), // Use RoundController's method
        seasonId,
        decidedWinner: { $ne: null }, // Check for decided winners instead of status
      }).exec();

      console.log(`Completed matches found: ${completedMatches.length}`);

      if (completedMatches.length === 0) {
        return res.status(404).json({
          message: "No completed matches found for the current round.",
        });
      }

      // Organize winners by zone
      const winnersByZone = {};
      completedMatches.forEach((match) => {
        const winner = match.decidedWinner;
        const zoneSlug = match.zoneSlug;

        if (!winnersByZone[zoneSlug]) {
          winnersByZone[zoneSlug] = [];
        }
        winnersByZone[zoneSlug].push(winner);
      });

      console.log("Winners by zone:", winnersByZone);

      const nextRoundMatches = [];
      for (const [zoneSlug, winners] of Object.entries(winnersByZone)) {
        if (winners.length < 2) {
          console.warn(
            `Not enough winners in zone ${zoneSlug} to create next round matches.`
          );
          continue; // Not enough winners to proceed
        }

        for (let i = 0; i < winners.length; i += 2) {
          if (winners[i + 1]) {
            // Ensure we have a pair
            nextRoundMatches.push({
              teamOneId: winners[i],
              teamTwoId: winners[i + 1],
              teamOneScore: 0,
              teamTwoScore: 0,
              status: "upcoming",
              roundSlug: roundController.generateSlug(nextRoundName), // Use RoundController's method
              zoneSlug,
              seasonId,
              matchNo: Math.floor(i / 2) + 1, // match number for the next round
            });
          }
        }
      }

      if (nextRoundMatches.length === 0) {
        return res
          .status(400)
          .json({ message: "No next round matches created." });
      }

      const savedNextRoundMatches = await Match.insertMany(nextRoundMatches);
      res.status(201).json({
        message: "Next round matches created successfully.",
        savedNextRoundMatches,
      });
    } catch (error) {
      console.error("Error creating next round matches:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Function to automatically progress teams from each zone to the final championship
  static progressToFinals = async (req, res) => {
    try {
      const { seasonId } = req.body;
      console.log(`Progressing to finals for season: ${seasonId}`);

      const zones = await Zone.find({}); // Assuming zones are predefined
      const winners = [];

      for (const zone of zones) {
        const completedMatches = await Match.find({
          zoneSlug: zone.slug,
          decidedWinner: { $ne: null }, // Check for decided winners instead of status
        }).exec();

        if (completedMatches.length === 0) {
          console.warn(`No completed matches found in zone ${zone.slug}.`);
          continue;
        }

        const lastMatch = completedMatches[completedMatches.length - 1];
        winners.push(lastMatch.decidedWinner);
      }

      if (winners.length < 2) {
        return res
          .status(400)
          .json({ message: "Not enough zone winners to proceed to finals." });
      }

      // Create final championship match
      const championshipMatch = new Match({
        teamOneId: winners[0], // Zone 1 winner
        teamTwoId: winners[1], // Zone 2 winner
        teamOneScore: 0,
        teamTwoScore: 0,
        status: "upcoming",
        roundSlug: "championship",
        zoneSlug: null,
        seasonId,
        matchNo: 1,
      });

      await championshipMatch.save();
      res.status(201).json({
        message: "Championship match created successfully.",
        championshipMatch,
      });
    } catch (error) {
      console.error("Error progressing to finals:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  static createFinalFourMatches = async (req, res) => {
    try {
      const { seasonId } = req.body;
      console.log(`Creating final four matches for season: ${seasonId}`);

      const zones = await Zone.find({});
      const winners = [];

      for (const zone of zones) {
        const completedMatches = await Match.find({
          zoneSlug: zone.slug,
          status: "completed",
        }).exec();

        if (completedMatches.length === 0) {
          console.warn(`No completed matches found in zone ${zone.slug}.`);
          continue;
        }

        const lastMatch = completedMatches[completedMatches.length - 1];
        winners.push(lastMatch.decidedWinner);
      }

      if (winners.length < 4) {
        return res
          .status(400)
          .json({ message: "Not enough zone winners to proceed to finals." });
      }

      // Create matches for the final four
      const finalFourMatches = [
        {
          teamOneId: winners[0], // Zone 1 winner
          teamTwoId: winners[1], // Zone 2 winner
          teamOneScore: 0,
          teamTwoScore: 0,
          status: "upcoming",
          roundSlug: "semifinals",
          zoneSlug: null,
          seasonId,
          matchNo: 1,
        },
        {
          teamOneId: winners[2], // Zone 3 winner
          teamTwoId: winners[3], // Zone 4 winner
          teamOneScore: 0,
          teamTwoScore: 0,
          status: "upcoming",
          roundSlug: "semifinals",
          zoneSlug: null,
          seasonId,
          matchNo: 2,
        },
      ];

      const savedFinalFourMatches = await Match.insertMany(finalFourMatches);
      res.status(201).json({
        message: "Final four matches created successfully.",
        savedFinalFourMatches,
      });
    } catch (error) {
      console.error("Error creating final four matches:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Create championship match based on final four winners
  static createChampionshipMatch = async (req, res) => {
    try {
      const { seasonId } = req.body;
      console.log(`Creating championship match for season: ${seasonId}`);

      const semifinals = await Match.find({
        roundSlug: "semifinals",
        seasonId,
        status: "completed",
      }).exec();

      if (semifinals.length < 2) {
        return res.status(400).json({
          message: "Not enough semifinal winners to create championship.",
        });
      }

      const winners = semifinals.map((match) => match.decidedWinner);

      const championshipMatch = new Match({
        teamOneId: winners[0], // Winner of semifinal 1
        teamTwoId: winners[1], // Winner of semifinal 2
        teamOneScore: 0,
        teamTwoScore: 0,
        status: "upcoming",
        roundSlug: "championship",
        zoneSlug: null,
        seasonId,
        matchNo: 1,
      });

      await championshipMatch.save();
      res.status(201).json({
        message: "Championship match created successfully.",
        championshipMatch,
      });
    } catch (error) {
      console.error("Error creating championship match:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Get a single match by ID
  static getMatchById = async (req, res) => {
    try {
      const match = await Match.findById(req.params.id).exec();
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      res.status(200).json(match);
    } catch (error) {
      console.error("Error fetching match:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Update final scores and determine the winner
  static finalScores = async (req, res) => {
    try {
      const { teamOneScore, teamTwoScore } = req.body;
      const { id } = req.params;

      if (!id || teamOneScore === undefined || teamTwoScore === undefined) {
        return res
          .status(400)
          .json({ message: "Match ID and scores are required" });
      }

      const match = await Match.findById(id).exec();
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      match.teamOneScore = teamOneScore;
      match.teamTwoScore = teamTwoScore;

      match.decidedWinner =
        teamOneScore > teamTwoScore
          ? match.teamOneId.toString()
          : teamTwoScore > teamOneScore
          ? match.teamTwoId.toString()
          : null;

      // Update match status to "completed"
      match.status = "completed";

      const updatedMatch = await match.save();

      // Trigger betting handling after match end
      await bettingController.handleMatchEnd({ params: { matchId: id } }, res);

      res
        .status(200)
        .json({ message: "Match updated successfully", updatedMatch });
    } catch (error) {
      console.error("Error updating final scores:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Delete a match by ID
  static deleteMatch = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedMatch = await Match.findByIdAndDelete(id).exec();

      if (!deletedMatch) {
        return res.status(404).json({ message: "Match not found" });
      }

      res.status(200).json({ message: "Match deleted successfully" });
    } catch (error) {
      console.error("Error deleting match:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Update a match
  static updateMatch = async (req, res) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;

      const updatedMatch = await Match.findByIdAndUpdate(id, updatedData, {
        new: true,
        runValidators: true,
      }).exec();

      if (!updatedMatch) {
        return res.status(404).json({ message: "Match not found" });
      }

      res
        .status(200)
        .json({ message: "Match updated successfully", updatedMatch });
    } catch (error) {
      console.error("Error updating match:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  static getMatch = async (req, res) => {
    try {
      const matches = await Match.aggregate([
        {
          $lookup: {
            from: "teams",
            localField: "teamOneId",
            foreignField: "_id",
            as: "teamOne",
          },
        },
        {
          $lookup: {
            from: "teams",
            localField: "teamTwoId",
            foreignField: "_id",
            as: "teamTwo",
          },
        },
        {
          $lookup: {
            from: "zones",
            localField: "zoneSlug",
            foreignField: "slug",
            as: "zone",
          },
        },
        {
          $lookup: {
            from: "rounds",
            localField: "roundSlug",
            foreignField: "slug",
            as: "round",
          },
        },
        {
          $unwind: { path: "$teamOne", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$teamTwo", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$zone", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$round", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            _id: 1,
            teamOneId: 1,
            teamOneScore: 1,
            teamTwoId: 1,
            teamTwoScore: 1,
            decidedWinner: 1,
            status: 1,
            matchNo: 1,
            seasonId: 1,
            created: 1,
            updated: 1,
            teamOne: {
              _id: 1,
              name: 1,
              logo: 1,
            },
            teamTwo: {
              _id: 1,
              name: 1,
              logo: 1,
            },
            zone: {
              name: 1,
              slug: 1,
            },
            round: {
              number: 1,
              slug: 1,
            },
          },
        },
      ]);

      // Send response with populated matches
      res
        .status(200)
        .json({ message: "Match retrieved successfully", info: matches });
    } catch (error) {
      console.error("Error fetching matches:", error); // Log error for debugging
      res.status(500).json({ error: error.message }); // Send error response
    }
  };
}

module.exports = MatchController;
