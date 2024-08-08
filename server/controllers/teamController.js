const Team = require("../model/teamSchema");
const mongoose =require("mongoose")
const upload = require("../middleware/fileUpload");

const BASE_URL = "http://localhost:6010/";
const upload_URL = BASE_URL + "my-uploads/";

class teamController {
  static addTeam = async (req, res) => {
    try {
      upload.single("logo")(req, res, async (err) => {
        if (err) {
          console.error("Error uploading file:", err);
          return res.status(400).json({ message: "Error uploading file" });
        }

        const { name, status, seasonId, seed } = req.body;

        // Validate required fields
        if (!name || !status || !seed) {
          console.error("Missing required fields");
          return res.status(400).json({ message: "Missing required fields" });
        }

        // Validate
        if (!mongoose.Types.ObjectId.isValid(seasonId)) {
          console.error("Invalid seasonId");
          return res.status(400).json({ message: "Invalid seasonId" });
        }

        try {
          const user = new Team({
            name,
            seed,
            logo: `${upload_URL}${req.file.filename}`,
            seasonId,
            status: status || 1, // set default value for active field
          });

          await user.save();
          res.status(201).json(user);
        } catch (err) {
          console.error("Error creating team:", err);
          res.status(500).json({ message: "Error creating team" });
        }
      });
    } catch (err) {
      console.error("Error in addteam function:", err);
      res.status(500).json({ message: "Error creating team" });
    }
  };

  static deleteTeam = async (req, res) => {
    try {
      const teamid = req.params.id;
      const result = await Team.findByIdAndDelete(teamid);
      res
        .status(200)
        .json({ message: "team deleted successfully", info: result });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };

  static displayAll(req, res) {
    Team.find().then((data) => {
      res.status(200).json({
        message: "User list retrieved successfully!",
        users: data,
      });
    });
  }
  static displayById(req, res) {
    Team.findById({ _id: req.params.id }).then((data) => {
      res.status(200).json({
        message: "User related to id  retrieved successfully!",
        users: data,
      });
    });
  }

  static updateTeam = async (req, res) => {
    try {
      upload.single("logo")(req, res, async (err) => {
        if (err) {
          console.error("Error uploading file:", err);
          return res.status(400).json({ message: "Error uploading file" });
        }

        const { name, status, seasonId, seed } = req.body;

        const teamId = req.params.id;

        // Validate required fields
        if (!teamId) {
          console.error("Team ID is required");
          return res.status(400).json({ message: "Team ID is required" });
        }

        // Find the team by ID
        const team = await Team.findById(teamId);
        if (!team) {
          console.error("Team not found");
          return res.status(404).json({ message: "Team not found" });
        }

        // Update fields if changed
        if (req.body.name) team.name = req.body.name;
        if (req.body.status) team.status = req.body.status;
        if (req.body.seasonId) team.seasonId = req.body.seasonId;
        if (req.body.seed) team.seed = req.body.seed;

        // Update logo if uploaded
        if (req.file) {
          team.logo = `${upload_URL}${req.file.filename}`;
        }

        try {
          await team.save();
          res.status(200).json({ message: "Team updated successfully" });
        } catch (err) {
          console.error("Error updating team:", err);
          res.status(500).json({ message: "Error updating team" });
        }
      });
    } catch (err) {
      console.error("Error in updateTeam function:", err);
      res.status(500).json({ message: "Error updating team" });
    }
  };
}

module.exports = teamController;
