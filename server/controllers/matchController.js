// controllers/matchController.js

const Match = require("../model/matches");
const Team = require("../model/teams");
const Round = require("../model/rounds");
const Season = require("../model/season");
const Zone = require("../model/zones");

// Create a new match
exports.createMatch = async (req, res) => {
  try {
    // Log the request body
    console.log("Request Body:", req.body);

    const {
      teamOneId,
      teamTwoId,
      teamOneScore =0,
      teamTwoScore =0,
      finalscore,
      decidedWinner,
      status =0,
      roundSlug,
      zoneSlug,
      seasonId,
      matchNo,
    } = req.body;

    // Validate that IDs are present
    if (!teamOneId || !teamTwoId || !decidedWinner) {
      return res
        .status(400)
        .json({ message: "Team IDs and decided winner are required" });
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
    console.log("Fetched Documents:", {
      teamOne,
      teamTwo,
      season,
      round,
      zone,
    });

    // Check if teams exist
    if (!teamOne || !teamTwo) {
      return res.status(404).json({ message: "One or both teams not found" });
    }

    // Check if decidedWinner exists
    if (
      !teamOne ||
      !teamTwo ||
      (teamOne._id.toString() !== decidedWinner.toString() &&
        teamTwo._id.toString() !== decidedWinner.toString())
    ) {
      return res
        .status(404)
        .json({ message: "Decided winner not found among the teams" });
    }

    // Check if season exists
    if (seasonId && !season) {
      return res.status(404).json({ message: "Season not found" });
    }

    // Create and save the match document
    const match = new Match({
      teamOneId,
      teamTwoId,
      teamOneScore,
      teamTwoScore,
      finalscore,
      decidedWinner,
      status,
      roundSlug,
      zoneSlug,
      seasonId,
      matchNo,
    });

    const savedMatch = await match.save();

    // Respond with the saved match
    res.status(201).json({message:"match created successfully",savedMatch});
  } catch (error) {
    // Log error details
    console.error("Error occurred while creating match:", error);

    // Respond with error message
    res.status(400).json({ error: error.message });
  }
};

//Get a single match by ID
exports.getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("teamOneId")
      .populate("teamTwoId")
      .populate("decidedWinner")
      .populate("seasonId");

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a match by ID
exports.deleteMatch = async (req, res) => {
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
 
 

exports.updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamOneId,
      teamTwoId,
      teamOneScore,
      teamTwoScore,
      finalscore,
      decidedWinner,
      status,
      roundSlug,
      zoneSlug,
      seasonId,
      matchNo,
       
    } = req.body;

    // Find the match by ID
    const match = await Match.findById(id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Validate and check existence of related entities
    if (teamOneId && !(await Team.findById(teamOneId))) {
      return res.status(404).json({ error: 'Team One not found' });
    }

    if (teamTwoId && !(await Team.findById(teamTwoId))) {
      return res.status(404).json({ error: 'Team Two not found' });
    }

    if (seasonId && !(await Season.findById(seasonId))) {
      return res.status(404).json({ error: 'Season not found' });
    }

    if (roundSlug && !(await Round.findById(roundSlug))) {
      return res.status(404).json({ error: 'Round not found' });
    }

    if (zoneSlug && !(await Zone.findById(zoneSlug))) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    
    if (teamOneId && teamTwoId && teamOneId === teamTwoId) {
      return res.status(400).json({ error: 'Team One and Team Two cannot be the same' });
    }

    // Validate decidedWinner is among the teams
    if (decidedWinner && (teamOneId && teamTwoId)) {
      if (![teamOneId, teamTwoId].includes(decidedWinner)) {
        return res.status(400).json({ error: 'Decided winner must be one of the teams' });
      }
    }

    // Perform the update
    const updatedMatch = await Match.findByIdAndUpdate(
      id,
      {
        $set: {
          teamOneId,
          teamTwoId,
           status,
          finalscore,
          matchNo,
          decidedWinner,
          roundSlug,
          zoneSlug,
          seasonId,
          teamOneScore: teamOneScore || match.teamOneScore, // Preserve existing scores if not updated
          teamTwoScore: teamTwoScore || match.teamTwoScore, // Preserve existing scores if not updated
        }
      },
      { new: true }
    );

    // Respond with the updated match
    res.status(200).json({ message: 'Update done successfully', info: updatedMatch });
  } catch (err) {
    // Log error details
    console.error("Error updating match:", err);

    // Respond with an error message
    res.status(500).json({ error: err.message });
  }
};

 
