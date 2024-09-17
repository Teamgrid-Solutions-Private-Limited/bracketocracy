const Match = require("../model/matchSchema");
const Team = require("../model/teamSchema");
const Round = require("../model/roundSchema");
const Season = require("../model/seasonSchema");
const Zone = require("../model/zoneSchema");
const bettingController = require("../controllers/bettingController");

const createMatch = async (
  teamOneId,
  teamTwoId,
  teamOneScore = 0,
  teamTwoScore = 0,
  status = 0,
  roundSlug,
  zoneSlug,
  seasonId,
  matchNo
) => {
  try {
    if (!teamOneId || !teamTwoId) {
      throw new Error("Team IDs are required");
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

    // Check if teams exist
    if (!teamOne || !teamTwo) {
      throw new Error("One or both teams not found");
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

    return await match.save();
  } catch (error) {
    throw new Error(`Failed to create match: ${error.message}`);
  }
};

module.exports = { createMatch };
