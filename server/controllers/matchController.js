const Match = require("../model/matchSchema");
const Team = require("../model/teamSchema");
const Round = require("../model/roundSchema");
const Season = require("../model/seasonSchema");
const Zone = require("../model/zoneSchema");
const bettingController = require("./bettingController");
const roundController = require("./roundController");

class MatchController {
  // Initialize Round 1 (Create initial matches in each zone)
  static initializeRoundOne = async (req, res) => {
    try {
      const { seasonId } = req.body;

      // Fetch active zones and teams for the season
      const zones = await Zone.find().exec();
      const teams = await Team.find({ seasonId }).exec();

      if (teams.length === 0 || zones.length === 0) {
        return res.status(404).json({
          message: "No teams or zones found for the given season",
        });
      }

      const matches = [];
      let matchNo = 1;
      const roundSlug = "play-in";

      for (const zone of zones) {
        const zoneTeams = teams.filter(
          (team) => team.zoneId.toString() === zone._id.toString()
        );
        zoneTeams.sort(() => Math.random() - 0.5); // Shuffle teams

        for (let i = 0; i < zoneTeams.length; i += 2) {
          if (i + 1 < zoneTeams.length) {
            matches.push({
              teamOneId: zoneTeams[i]._id,
              teamTwoId: zoneTeams[i + 1]._id,
              teamOneScore: 0,
              teamTwoScore: 0,
              status: "completed",
              roundSlug,
              zoneSlug: zone.slug,
              seasonId,
              matchNo: matchNo++,
            });
          }
        }
      }

      // Bulk insert matches
      const savedMatches = await Match.insertMany(matches);
      res.status(201).json({
        message: "Round 1 matches created successfully",
        roundSlug, // Adding roundSlug to the response
        savedMatches,
      });
    } catch (error) {
      console.error("Error initializing Round 1:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Create matches for the next round using winners from the previous round
  static createNextRound = async (req, res) => {
    try {
      const { seasonId, currentRoundName, nextRoundName } = req.body;
      const currentRoundSlug = roundController.generateSlug(currentRoundName);
      const nextRoundSlug = roundController.generateSlug(nextRoundName);

      // Fetch completed matches from the current round
      const completedMatches = await Match.find({
        roundSlug: currentRoundSlug,
        seasonId,
        status: "upcoming",
      }).exec();

      if (completedMatches.length === 0) {
        return res.status(404).json({
          message: "No completed matches found for the current round",
        });
      }

      const nextRoundMatches = [];
      let matchNo = 1;

      for (let i = 0; i < completedMatches.length; i += 2) {
        const winnerOne = completedMatches[i].decidedWinner;
        const winnerTwo = completedMatches[i + 1]?.decidedWinner;

        if (!winnerOne || !winnerTwo) {
          console.error(
            `Missing winners for matches: ${completedMatches[i]._id}, ${
              completedMatches[i + 1]?._id
            }`
          );
          continue;
        }

        nextRoundMatches.push({
          teamOneId: winnerOne,
          teamTwoId: winnerTwo,
          teamOneScore: 0,
          teamTwoScore: 0,
          status: "upcoming",
          roundSlug: nextRoundSlug,
          zoneSlug: completedMatches[i].zoneSlug,
          seasonId,
          matchNo: matchNo++,
        });
      }

      if (nextRoundMatches.length === 0) {
        return res.status(400).json({
          message: "No next round matches were created",
        });
      }

      const savedNextRoundMatches = await Match.insertMany(nextRoundMatches);
      res.status(201).json({
        message: "Next round matches created successfully",
        savedNextRoundMatches,
      });
    } catch (error) {
      console.error("Error creating next round matches:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Determine the next round and generate matches
  static progressToNextRound = async (req, res) => {
    try {
      const { seasonId, currentRoundName } = req.body;
      const nextRoundMap = {
        "round 1": "round 2",
        "round 2": "sweet 16",
        "sweet 16": "elite 8",
        "elite 8": "final 4",
        "final 4": "championship",
      };

      const nextRoundName = nextRoundMap[currentRoundName.toLowerCase()];
      if (!nextRoundName) {
        return res.status(400).json({ message: "Invalid current round" });
      }

      await MatchController.createNextRound(
        { body: { seasonId, currentRoundName, nextRoundName } },
        res
      );
    } catch (error) {
      console.error("Error progressing to next round:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Create a single match
  static createMatch = async (req, res) => {
    try {
      const {
        teamOneId,
        teamTwoId,
        teamOneScore = 0,
        teamTwoScore = 0,
        status = "upcoming",
        roundSlug,
        zoneSlug,
        seasonId,
        matchNo,
      } = req.body;

      if (!teamOneId || !teamTwoId) {
        return res.status(400).json({ message: "Team IDs are required" });
      }

      const [teamOne, teamTwo, season, round, zone] = await Promise.all([
        Team.findById(teamOneId).exec(),
        Team.findById(teamTwoId).exec(),
        seasonId ? Season.findById(seasonId).exec() : null,
        roundSlug ? Round.findOne({ slug: roundSlug }).exec() : null,
        zoneSlug ? Zone.findOne({ slug: zoneSlug }).exec() : null,
      ]);

      if (!teamOne || !teamTwo) {
        return res.status(404).json({ message: "Teams not found" });
      }

      const match = new Match({
        teamOneId,
        teamTwoId,
        teamOneScore,
        teamTwoScore,
        status,
        roundSlug,
        zoneSlug,
        seasonId,
        matchNo,
      });

      const savedMatch = await match.save();
      res
        .status(201)
        .json({ message: "Match created successfully", savedMatch });
    } catch (error) {
      console.error("Error creating match:", error);
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
}

module.exports = MatchController;
