const Team = require("../model/teamSchema");
const Match = require("../model/matchSchema");
const Round = require("../model/roundSchema");
const Zone = require("../model/zoneSchema");
const Season = require("../model/seasonSchema"); // Import the Season model
const slugify = require("slugify"); // Ensure to install this package

class RoundController {
  // Generate slug from round name
  static generateSlug = (roundName) => {
    switch (roundName.toLowerCase()) {
      case "play in match":
        return "playin";
      case "round 1":
        return "round-1";
      case "round 2":
        return "round-2";
      case "sweet 16":
        return "round-3";
      case "elite 8":
        return "round-4";
      case "final 4":
        return "round-5";
      case "final (championship game)":
        return "round-6";
      default:
        return `round-${
          roundName.match(/\d+/) ? roundName.match(/\d+/)[0] : "unknown"
        }`;
    }
  };

  // Generate round number from round name
  static generateNumber = (roundName) => {
    switch (roundName.toLowerCase()) {
      case "play in match":
        return 0;
      case "round 1":
        return 1;
      case "round 2":
        return 2;
      case "sweet 16":
        return 3;
      case "elite 8":
        return 4;
      case "final 4":
        return 5;
      case "final (championship game)":
        return 6;
      default:
        return null;
    }
  };

  // Initialize Round 1 for all zones
  // Initialize Round 1 for all zones
  static initializeRoundOne = async (req, res) => {
    try {
      // Fetch all active zones from the database
      const zones = await Zone.find({ status: true }).select("zoneName slug");
 
      if (!zones.length) {
        return res.status(400).json({ message: "No active zones found." });
      }
 
      // Loop over zones and create matches
      for (const zone of zones) {
        // Find teams based on the zone name
        const teams = await Team.find({ zoneName: zone.zoneName }); // Assuming teams have a `zoneName` field to link to the zone
 
        if (teams.length !== 16) {
          return res
            .status(400)
            .json({ message: `${zone.zoneName} must have exactly 16 teams.` });
        }
 
        // Shuffle teams to randomize pairing
        const shuffledTeams = teams.sort(() => 0.5 - Math.random());
 
        // Create matches for round 1
        const matchPromises = [];
        for (let i = 0; i < shuffledTeams.length; i += 2) {
          const match = new Match({
            teamOneId: shuffledTeams[i]._id,
            teamTwoId: shuffledTeams[i + 1]._id,
            roundNumber: 1,
            zoneSlug: zone.slug || zone.zoneName, // Use slug if available
          });
          matchPromises.push(match.save());
        }
        await Promise.all(matchPromises); // Save all matches in parallel
 
        // Create and save the round
        const name = "Round 1";
        const playDate = new Date(); // Set playDate as per your logic, e.g., a week from now
        const biddingEndDate = new Date();
        biddingEndDate.setHours(biddingEndDate.getHours() + 1); // Example: bidding ends 1 hour after
 
        // Validate and prepare round details
        const slug = slugify(this.generateSlug(name), { lower: true });
        const roundNumber = this.generateNumber(name);
 
        const round = new Round({
          name,
          slug,
          playDate,
          biddingEndDate,
          seasonId: req.body.seasonId, // Assuming seasonId is passed in request body
          roundNumber,
        });
 
        await round.save();
      }
 
      return res
        .status(201)
        .json({ message: "Round 1 initialized successfully for all zones" });
    } catch (error) {
      console.error("Error initializing Round 1:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Progress winners to the next round
  static completeRoundAndCreateNext = async (req, res) => {
    try {
      const { zone, roundNumber } = req.body;

      // Fetch all matches from the current round in the zone
      const matches = await Match.find({
        roundNumber,
        zone,
        matchStatus: "completed",
      });

      if (matches.length === 0) {
        return res.status(404).json({
          message: `No completed matches found for ${zone} in Round ${roundNumber}`,
        });
      }

      // Collect winners from current round
      const winners = matches
        .map((match) => match.winner)
        .filter((winner) => winner);

      // Check if all matches have a winner
      if (winners.length !== matches.length) {
        return res
          .status(400)
          .json({ message: "Not all matches have been completed yet." });
      }

      // Proceed to the next round
      const nextRoundNumber = roundNumber + 1;
      if (nextRoundNumber > 6) {
        return res
          .status(400)
          .json({ message: "Championship round is the final round." });
      }

      // Pair winners for the next round
      const nextRoundMatches = [];
      for (let i = 0; i < winners.length; i += 2) {
        const match = new Match({
          teamOneId: winners[i],
          teamTwoId: winners[i + 1] || null, // Handle odd number of teams
          roundNumber: nextRoundNumber,
          zone,
        });
        nextRoundMatches.push(match);
      }

      await Match.insertMany(nextRoundMatches);

      // Create a new round
      const newRound = new Round({
        name: `Round ${nextRoundNumber}`,
        roundNumber: nextRoundNumber,
        zone,
      });
      await newRound.save();

      return res
        .status(200)
        .json({ message: `Round ${nextRoundNumber} created for ${zone}` });
    } catch (error) {
      console.error("Error completing round:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Progress to the Championship Round
  static createChampionship = async (req, res) => {
    try {
      // Fetch the winners of each zone's final round
      const winners = [];

      for (let zone of ["Zone 1", "Zone 2", "Zone 3", "Zone 4"]) {
        const finalRoundMatch = await Match.findOne({
          zone,
          roundNumber: 6,
          matchStatus: "completed",
        });
        if (!finalRoundMatch) {
          return res
            .status(400)
            .json({ message: `Final round in ${zone} is not completed yet.` });
        }
        winners.push(finalRoundMatch.winner);
      }

      // Create championship matches
      const championshipMatch = new Match({
        teamOneId: winners[0],
        teamTwoId: winners[1],
        roundNumber: 7, // Championship
        zone: "Championship",
      });
      await championshipMatch.save();

      return res
        .status(200)
        .json({ message: "Championship round created successfully" });
    } catch (error) {
      console.error("Error creating championship:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

module.exports = RoundController;
