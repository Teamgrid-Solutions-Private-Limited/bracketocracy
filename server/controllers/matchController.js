const Match = require("../model/matchSchema");
const Team = require("../model/teamSchema");
const Round = require("../model/roundSchema");
const Season = require("../model/seasonSchema");
const Zone = require("../model/zoneSchema");
const bettingController = require("./bettingController");

class MatchController {
  static roundOrder = [
    "play in match",
    "round 1",
    "round 2",
    "sweet 16",
    "elite 8",
    "final 4",
    "final (championship game)",
  ];

  static getNextRound(currentRoundName) {
    const currentIndex = this.roundOrder.findIndex(
      (round) => round.toLowerCase() === currentRoundName.toLowerCase()
    );
    return currentIndex !== -1 && currentIndex < this.roundOrder.length - 1
      ? this.roundOrder[currentIndex + 1]
      : null;
  }

  static generateRoundSlug(roundName) {
    const slugMap = {
      "play in match": "playin",
      "round 1": "round-1",
      "round 2": "round-2",
      "sweet 16": "round-3",
      "elite 8": "round-4",
      "final 4": "round-5",
      "final (championship game)": "round-6",
    };

    return (
      slugMap[roundName.toLowerCase()] ||
      `round-${roundName.match(/\d+/) ? roundName.match(/\d+/)[0] : "unknown"}`
    );
  }

  static async createNextRound(req, res) {
    try {
      const { seasonId, currentRoundName } = req.body;

      if (!seasonId || !currentRoundName) {
        return res
          .status(400)
          .json({ message: "Season ID and current round name are required." });
      }

      const nextRoundName = MatchController.getNextRound(currentRoundName);
      if (!nextRoundName) {
        return res.status(400).json({ message: "Invalid current round." });
      }

      const completedMatches = await Match.find({
        roundSlug: MatchController.generateRoundSlug(currentRoundName),
        seasonId,
        decidedWinner: { $ne: null },
      });

      if (!completedMatches.length) {
        return res.status(404).json({
          message: "No completed matches found for the current round.",
        });
      }

      const winnersByZone = completedMatches.reduce((acc, match) => {
        const winner = match.decidedWinner;
        const zoneSlug = match.zoneSlug;
        if (!acc[zoneSlug]) acc[zoneSlug] = [];
        acc[zoneSlug].push(winner);
        return acc;
      }, {});

      const nextRoundMatches = [];
      for (const [zoneSlug, winners] of Object.entries(winnersByZone)) {
        if (winners.length < 2) {
          console.warn(
            `Not enough winners in zone ${zoneSlug} to create next round matches.`
          );
          continue;
        }

        for (let i = 0; i < winners.length; i += 2) {
          if (winners[i + 1]) {
            nextRoundMatches.push({
              teamOneId: winners[i],
              teamTwoId: winners[i + 1],
              teamOneScore: 0,
              teamTwoScore: 0,
              status: "upcoming",
              roundSlug: MatchController.generateRoundSlug(nextRoundName),
              zoneSlug,
              seasonId,
              matchNo: Math.floor(i / 2) + 1,
            });
          }
        }
      }

      if (!nextRoundMatches.length) {
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
  }

  // New method for progressing to Final 4
  static async progressToFinalFour(req, res) {
    try {
      const { seasonId } = req.body;

      const completedMatches = await Match.find({
        roundSlug: MatchController.generateRoundSlug("round-3"),
        seasonId,
        decidedWinner: { $ne: null },
      });

      if (completedMatches.length < 4) {
        return res.status(400).json({
          message: "Not enough completed matches to proceed to Final 4.",
        });
      }

      const winners = completedMatches.map((match) => match.decidedWinner);

      // Create Final 4 matches
      const finalFourMatches = [
        {
          teamOneId: winners[0],
          teamTwoId: winners[1],
          teamOneScore: 0,
          teamTwoScore: 0,
          status: "upcoming",
          roundSlug: MatchController.generateRoundSlug("round-4"),
          zoneSlug: null,
          seasonId,
          matchNo: 1,
        },
        {
          teamOneId: winners[2],
          teamTwoId: winners[3],
          teamOneScore: 0,
          teamTwoScore: 0,
          status: "upcoming",
          roundSlug: MatchController.generateRoundSlug("round-4"),
          zoneSlug: null,
          seasonId,
          matchNo: 2,
        },
      ];

      await Match.insertMany(finalFourMatches);
      res.status(201).json({
        message: "Final 4 matches created successfully.",
        finalFourMatches,
      });
    } catch (error) {
      console.error("Error progressing to Final 4:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // New method for creating the Championship match
  static async createChampionshipMatch(req, res) {
    try {
      const { seasonId } = req.body;

      const completedMatches = await Match.find({
        roundSlug: MatchController.generateRoundSlug("elite 8"),
        seasonId,
        decidedWinner: { $ne: null },
      });

      if (completedMatches.length < 2) {
        return res.status(400).json({
          message:
            "Not enough completed matches to create the Championship match.",
        });
      }

      const winners = completedMatches.map((match) => match.decidedWinner);

      const championshipMatch = new Match({
        teamOneId: winners[0],
        teamTwoId: winners[1],
        teamOneScore: 0,
        teamTwoScore: 0,
        status: "upcoming",
        roundSlug: MatchController.generateRoundSlug(
          "final (championship game)"
        ),
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
      console.error("Error creating Championship match:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async finalScores(req, res) {
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

      match.status = "completed"; // Update match status to "completed"

      const updatedMatch = await match.save();
      await bettingController.handleMatchEnd({ params: { matchId: id } }, res);

      res
        .status(200)
        .json({ message: "Match updated successfully", updatedMatch });
    } catch (error) {
      console.error("Error updating final scores:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async getMatchById(req, res) {
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
  }

  static async deleteMatch(req, res) {
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
  }

  static async updateMatch(req, res) {
    try {
      const { id } = req.params;
      const updatedData = req.body;

      const updatedMatch = await Match.findByIdAndUpdate(id, updatedData, {
        new: true,
        runValidators: true,
      });

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
  }

  static async getMatch(req, res) {
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

      res
        .status(200)
        .json({ message: "Match retrieved successfully", info: matches });
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = MatchController;
