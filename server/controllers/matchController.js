// controllers/matchController.js

const Match = require("../model/matchSchema");
const Team = require("../model/teamSchema");
const Round = require("../model/roundSchema");
const Season = require("../model/seasonSchema");
const Zone = require("../model/zoneSchema");

class matchController {
  
 static createMatch = async (req, res) => {
    try {
      

      const {
        teamOneId,
        teamTwoId,
        teamOneScore = 0,
        teamTwoScore = 0,
        status = 0,
        roundSlug,
        zoneSlug,
        seasonId,
        matchNo,
      } = req.body;

      // Validate that IDs are present
      if (!teamOneId || !teamTwoId) {
        return res.status(400).json({ message: "Team IDs are required" });
      }

      // Fetch documents from the database
      const teamOne = await Team.findById(teamOneId).exec();
      const teamTwo = await Team.findById(teamTwoId).exec();
      const season = seasonId ? await Season.findById(seasonId).exec() : null;
      const round = roundSlug
        ? await Round.findOne({ slug: roundSlug }).exec()
        : null;
      const zone = zoneSlug
        ? await Zone.findOne({ slug: zoneSlug }).exec()
        : null;

      // Log fetched documents
      // console.log("Fetched Documents:", {
      //   teamOne,
      //   teamTwo,
      //   season,
      //   round,
      //   zone,
      // });

      // Check if teams exist
      if (!teamOne || !teamTwo) {
        return res.status(404).json({ message: "One or both teams not found" });
      }

      // Create and save the match document
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

      // Respond with the saved match
      res
        .status(201)
        .json({ message: "Match created successfully", savedMatch });
    } catch (error) {
      // Log error details
      console.error("Error occurred while creating match:", error);

      // Respond with error message
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Get a single match by ID
  static getMatchById = async (req, res) => {
    try {
      const match = await Match.findById(req.params.id);
      // .populate("teamOneId")
      // .populate("teamTwoId")
      // .populate("decidedWinner")
      // .populate("seasonId");

      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      res.status(200).json(match);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

 

  static finalScores = async (req, res) => {
    try {
      const { teamOneScore, teamTwoScore } = req.body;
      const { id } = req.params;
  
      // console.log(`ID: ${id}`);
      // console.log(`Team One Score: ${teamOneScore}`);
      // console.log(`Team Two Score: ${teamTwoScore}`);
  
      // Validate that ID and scores are present
      if (!id || teamOneScore === undefined || teamTwoScore === undefined) {
        return res.status(400).json({ message: "Match ID and scores are required" });
      }
  
      // Find the match
      const match = await Match.findById(id).exec();
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
  
      // Update scores
      match.teamOneScore = teamOneScore;
      
      match.teamTwoScore = teamTwoScore;
     
  
      // Determine the decided winner based on updated scores
      let decidedWinner = null;
      if (teamOneScore > teamTwoScore) {
        decidedWinner = match.teamOneId.toString();
      } else if (teamTwoScore > teamOneScore) {
        decidedWinner = match.teamTwoId.toString();
      } else {
        decidedWinner = null; // Or handle ties if applicable
      }
  
      // console.log(`Decided Winner (ID): ${decidedWinner}`);
  
      // Update decidedWinner
      match.decidedWinner = decidedWinner;
  
      // Save the updated match
      const updatedMatch = await match.save();
  
      // Respond with the updated match
      res.status(200).json({ message: "Match updated successfully", updatedMatch });
    } catch (error) {
      console.error("Error occurred while updating match:", error);
      res.status(500).json({ error: "Internal Server Error" });
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

  static updateMatch = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        teamOneId,
        teamTwoId,
        teamOneScore,
        teamTwoScore,
        status,
        roundSlug,
        zoneSlug,
        seasonId,
        matchNo,
      } = req.body;

      // Find the match by ID
      const match = await Match.findById(id);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      // Validate and check existence of related entities
      if (teamOneId && !(await Team.findById(teamOneId))) {
        return res.status(404).json({ error: "Team One not found" });
      }

      if (teamTwoId && !(await Team.findById(teamTwoId))) {
        return res.status(404).json({ error: "Team Two not found" });
      }

      if (seasonId && !(await Season.findById(seasonId))) {
        return res.status(404).json({ error: "Season not found" });
      }

      if (roundSlug && !(await Round.findById(roundSlug))) {
        return res.status(404).json({ error: "Round not found" });
      }

      if (zoneSlug && !(await Zone.findById(zoneSlug))) {
        return res.status(404).json({ error: "Zone not found" });
      }

      if (teamOneId && teamTwoId && teamOneId === teamTwoId) {
        return res
          .status(400)
          .json({ error: "Team One and Team Two cannot be the same" });
      }

      // Perform the update
      const updatedMatch = await Match.findByIdAndUpdate(
        id,
        {
          $set: {
            teamOneId,
            teamTwoId,
            status,

            matchNo,

            roundSlug,
            zoneSlug,
            seasonId,
            teamOneScore: teamOneScore || match.teamOneScore, // Preserve existing scores if not updated
            teamTwoScore: teamTwoScore || match.teamTwoScore, // Preserve existing scores if not updated
          },
        },
        { new: true }
      );

      // Respond with the updated match
      res
        .status(200)
        .json({ message: "Update done successfully", info: updatedMatch });
    } catch (err) {
      // Log error details
      console.error("Error updating match:", err);

      // Respond with an error message
      res.status(500).json({ error: err.message });
    }
  };
}
module.exports = matchController;
