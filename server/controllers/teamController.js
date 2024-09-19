const Team = require("../model/teamSchema");
//check
const mongoose = require("mongoose");
const upload = require("../middleware/fileUpload");

const BASE_URL = "http://localhost:4000/";
const upload_URL = BASE_URL + "images/";

class TeamController {
  static handleFileUpload = (req, res, next) => {
    upload.single("logo")(req, res, (err) => {
      if (err) {
        console.error("Error uploading file:", err);
        return res.status(400).json({ message: "Error uploading file" });
      }
      next();
    });
  };

  static addTeam = async (req, res) => {
    try {
      // Handle file upload asynchronously
      await TeamController.handleFileUpload(req, res, async () => {
        const { name, status, seasonId, seed, zoneName } = req.body;

        // Validate required fields
        if (!name || !status || !seed) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        // Validate seasonId (ensure it is a valid ObjectId)
        if (seasonId && !mongoose.Types.ObjectId.isValid(seasonId)) {
          return res.status(400).json({ message: "Invalid seasonId" });
        }

        // Validate zoneName based on the expected type (assuming it's a string here)
        if (zoneName && !mongoose.Types.ObjectId.isValid(zoneName)) {
          return res.status(400).json({ message: "Invalid zoneName ID" });
        }

        try {
          const team = new Team({
            name,
            seed,
            logo: req.file ? `${upload_URL}${req.file.filename}` : undefined,
            seasonId,
            zoneName,
            status: status || 1, // Default value for status
          });

          const result = await team.save();
          return res
            .status(201)
            .json({ message: "Team created successfully", data: result });
        } catch (err) {
          console.error("Error creating team:", err);
          return res.status(500).json({ message: "Error creating team" });
        }
      });
    } catch (err) {
      console.error("Error in addTeam controller:", err);
      return res.status(500).json({ message: "Error creating team" });
    }
  };

  static deleteTeam = async (req, res) => {
    try {
      const teamId = req.params.id;
      const result = await Team.findByIdAndDelete(teamId);

      if (!result) {
        return res.status(404).json({ message: "Team not found" });
      }

      res
        .status(200)
        .json({ message: "Team deleted successfully", info: result });
    } catch (err) {
      res.status(500).json({ message: "Error deleting team" });
    }
  };

  static displayAll = async (req, res) => {
    try {
      const data = await Team.find();
      res
        .status(200)
        .json({ message: "Teams retrieved successfully", info: data });
    } catch (err) {
      res.status(500).json({ message: "Error retrieving teams" });
    }
  };

  static displayById = async (req, res) => {
    try {
      const teamId = req.params.id;
      const data = await Team.findById(teamId);

      if (!data) {
        return res.status(404).json({ message: "Team not found" });
      }

      res.status(200).json({ message: "Team retrieved successfully", data });
    } catch (err) {
      res.status(500).json({ message: "Error retrieving team" });
    }
  };

  static updateTeam = async (req, res) => {
    try {
      await TeamController.handleFileUpload(req, res, async () => {
        const { name, status, seasonId, seed } = req.body;
        const teamId = req.params.id;

        // Validate teamId
        // Validate teamId
        if (!teamId) {
          return res.status(400).json({ message: "Team ID is required" });
        }

        const team = await Team.findById(teamId);

        if (!team) {
          return res.status(404).json({ message: "Team not found" });
        }

        // Update fields if present
        if (name) team.name = name;
        if (status) team.status = status;
        if (seasonId) {
          if (!mongoose.Types.ObjectId.isValid(seasonId)) {
            return res.status(400).json({ message: "Invalid seasonId" });
          }
          team.seasonId = seasonId;
        }
        if (seed) team.seed = seed;

        // Update logo if uploaded
        if (req.file) {
          team.logo = `${upload_URL}${req.file.filename}`;
        }

        try {
          const updatedTeam = await team.save();
          res
            .status(200)
            .json({ message: "Team updated successfully", data: updatedTeam });
        } catch (err) {
          res.status(500).json({ message: "Error updating team" });
        }
      });
    } catch (err) {
      res.status(500).json({ message: "Error updating team" });
    }
  };
}

module.exports = TeamController;
