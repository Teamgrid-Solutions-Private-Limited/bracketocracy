// controllers/matchController.js

const Match = require("../model/matchSchema");
const Team = require("../model/teamSchema");
const Round = require("../model/roundSchema");
const Season = require("../model/seasonSchema");
const Zone = require("../model/zoneSchema");
const bettingController = require("./bettingController");

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = "BadRequestError";
  }
}

class MatchController {
  // Create matches for the first round manually
  static createMatchesForFirstRound = async (req, res) => {
    try {
      const { seasonId } = req.body;

      // Validate that seasonId is present
      if (!seasonId) {
        return res.status(400).json({ message: "Season is required" });
      }

      // Fetch 16 teams and populate zone details (slug)
      const teams = await Team.find({ seasonId })
        .limit(16)
        .populate({ path: "zoneId", select: "slug" }) // Populate the zoneId to get the zone's slug
        .exec();

      if (teams.length < 16) {
        return res
          .status(400)
          .json({ message: "Not enough teams in this season" });
      }

      // Ensure all teams are from the same zone and get the zoneSlug
      const zoneSlug = teams[0].zoneId.slug; // Access the populated slug field from the zone

      // Create matches for the first round
      const matches = [];
      for (let i = 0; i < teams.length; i += 2) {
        const match = new Match({
          teamOneId: teams[i]._id,
          teamTwoId: teams[i + 1]._id,
          teamOneScore: 0,
          teamTwoScore: 0,
          status: "upcoming",
          zoneSlug: zoneSlug, // Set zoneSlug from the populated zone data
          seasonId,
          matchNo: Math.floor(i / 2) + 1,
        });
        const savedMatch = await match.save();
        matches.push(savedMatch);
      }

      res.status(201).json({
        message: `Matches for Round 1 in zone ${zoneSlug} created successfully`,
        matches,
      });
    } catch (error) {
      console.error("Error occurred while creating matches:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Handle match and automatically progress
  static handleMatchAndProgress = async (
    matchId,
    teamOneScore,
    teamTwoScore
  ) => {
    // Step 1: Update match scores
    const updatedMatch = await MatchController.finalScores({
      params: { id: matchId },
      body: { teamOneScore, teamTwoScore },
    });

    // Step 2: If it's the championship round, exit
    if (updatedMatch.roundSlug === "championship") {
      return;
    }

    // Step 3: Progress to the next round
    const nextRoundSlug = MatchController.getNextRoundSlug(
      updatedMatch.roundSlug
    );
    await MatchController.progressToNextRound({
      body: {
        currentRoundSlug: updatedMatch.roundSlug,
        nextRoundSlug,
        zoneSlug: updatedMatch.zoneSlug,
        seasonId: updatedMatch.seasonId,
      },
    });
  };

  // Progress to the next round
  static progressToNextRound = async (req, res) => {
    try {
      const { currentRoundSlug, nextRoundSlug, zoneSlug, seasonId } = req.body;

      // Validate required fields
      if (!currentRoundSlug || !nextRoundSlug || !zoneSlug || !seasonId) {
        throw new BadRequestError("Missing required fields.");
      }

      const completedMatches = await Match.find({
        roundSlug: currentRoundSlug,
        teamOneScore: { $ne: null },
        teamTwoScore: { $ne: null },
        decidedWinner: { $exists: true },
      });

      if (!completedMatches.length) {
        return res
          .status(400)
          .json({ message: "No completed matches in the current round." });
      }

      const winners = completedMatches
        .map((match) => match.decidedWinner)
        .filter(Boolean);

      // Handle bye if odd number of winners
      let byeTeam = null;
      if (winners.length % 2 !== 0) {
        byeTeam = winners.pop(); // Remove one team for a bye
      }

      const nextRoundMatches = [];
      for (let i = 0; i < winners.length; i += 2) {
        const match = new Match({
          teamOneId: winners[i],
          teamTwoId: winners[i + 1],
          teamOneScore: 0,
          teamTwoScore: 0,
          status: "upcoming",
          roundSlug: nextRoundSlug,
          zoneSlug,
          seasonId,
          matchNo: Math.floor(i / 2) + 1,
        });

        const savedMatch = await match.save();
        nextRoundMatches.push(savedMatch);
      }

      // Handle bye team
      if (byeTeam) {
        const match = new Match({
          teamOneId: byeTeam,
          teamTwoId: null,
          teamOneScore: 0,
          teamTwoScore: 0,
          status: "bye",
          roundSlug: nextRoundSlug,
          zoneSlug,
          seasonId,
          matchNo: Math.floor(winners.length / 2) + 1,
        });

        const savedByeMatch = await match.save();
        nextRoundMatches.push(savedByeMatch);
      }

      res.status(201).json({
        message: `Matches for ${nextRoundSlug} created successfully`,
        matches: nextRoundMatches,
      });
    } catch (error) {
      console.error(
        "Error occurred while progressing to the next round:",
        error
      );
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Get the next round slug
  static getNextRoundSlug = (currentRoundSlug) => {
    const rounds = {
      round1: "round2",
      round2: "round3",
      round3: "round4",
      round4: "round5",
      round5: "championship",
    };
    return rounds[currentRoundSlug] || null;
  };

  // Update match scores and determine winner
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
          ? match.teamOneId
          : teamTwoScore > teamOneScore
          ? match.teamTwoId
          : null;
      match.status = "completed";

      const updatedMatch = await match.save();

      // Handle betting logic
      await bettingController.handleMatchEnd({ params: { matchId: id } }, res);
      return updatedMatch; // Return updated match details
    } catch (error) {
      console.error("Error occurred while updating match:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Function to determine the next round slug
  static getNextRoundSlug = (currentRoundSlug) => {
    const rounds = {
      round1: "round2",
      round2: "round3",
      round3: "round4",
      round4: "round5",
      round5: "final",
    };
    return rounds[currentRoundSlug] || null;
  };

  // Get a single match by ID
  static getMatchById = async (req, res) => {
    try {
      const match = await Match.findById(req.params.id).populate(
        "teamOneId teamTwoId decidedWinner seasonId"
      );

      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      res.status(200).json(match);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // Delete a match by ID
  static deleteMatch = async (req, res) => {
    try {
      const match = await Match.findByIdAndDelete(req.params.id);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      res.status(200).json({ message: "Match deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // Get all matches with details
  static getAllMatches = async (req, res) => {
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
        { $unwind: { path: "$teamOne", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$teamTwo", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$zone", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$round", preserveNullAndEmptyArrays: true } },
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

      res
        .status(200)
        .json({ message: "Matches retrieved successfully", info: matches });
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ error: error.message });
    }
  };
}

module.exports = MatchController;
