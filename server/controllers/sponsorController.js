const Sponsor = require("../model/sponsorSchema");
const upload = require("../middleware/fileUpload");

const BASE_URL = "http://localhost:6010/";
const upload_URL = BASE_URL + "my-uploads/";

class SponsorController {
  static handleFileUpload = (req, res, next) => {
    upload.single("logo")(req, res, (err) => {
      if (err) {
        console.error("Error uploading file:", err);
        return res.status(400).json({ message: "Error uploading file" });
      }
      next();
    });
  }

  static addSponsor = async (req, res) => {
    try {
      await SponsorController.handleFileUpload(req, res, async () => {
        const { companyName, website } = req.body;

        // Validate required fields
        if (!companyName || !website) {
          console.error("Missing required fields");
          return res.status(400).json({ message: "Missing required fields" });
        }

        try {
          const sponsor = new Sponsor({
            companyName,
            website,
            logo: req.file ? `${upload_URL}${req.file.filename}` : undefined,
          });

          const result = await sponsor.save();
          res.status(201).json({ message: "Sponsor added successfully", result });
        } catch (err) {
          console.error("Error saving sponsor:", err);
          res.status(500).json({ message: err.message });
        }
      });
    } catch (err) {
      console.error("Error in addSponsor function:", err);
      res.status(500).json({ message: "Error creating sponsor" });
    }
  }

  static deleteSponsor = async (req, res) => {
    try {
      const sponsorId = req.params.id;
      const result = await Sponsor.findByIdAndDelete(sponsorId);

      if (!result) {
        return res.status(404).json({ message: "Sponsor not found" });
      }

      res.status(200).json({ message: "Sponsor deleted successfully", info: result });
    } catch (err) {
      console.error("Error deleting sponsor:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static displayAll = async (req, res) => {
    try {
      const data = await Sponsor.find();
      res.status(200).json({
        message: "Sponsor list retrieved successfully!",
        sponsors: data,
      });
    } catch (err) {
      console.error("Error retrieving sponsors:", err);
      res.status(500).json({ message: "Error retrieving sponsors" });
    }
  }

  static displayById = async (req, res) => {
    try {
      const data = await Sponsor.findById(req.params.id);

      if (!data) {
        return res.status(404).json({ message: "Sponsor not found" });
      }

      res.status(200).json({
        message: "Sponsor related to ID retrieved successfully!",
        sponsor: data,
      });
    } catch (err) {
      console.error("Error retrieving sponsor by ID:", err);
      res.status(500).json({ message: "Error retrieving sponsor" });
    }
  }

  static updateSponsor = async (req, res) => {
    try {
      const { id } = req.params;
      const update = req.body;

      // Find the sponsor by ID and update its data
      const updatedSponsor = await Sponsor.findByIdAndUpdate(id, { $set: update }, { new: true });

      if (!updatedSponsor) {
        return res.status(404).json({ error: "Sponsor not found" });
      }

      res.status(200).json({ message: "Update done successfully", info: updatedSponsor });
    } catch (err) {
      console.error("Error updating sponsor:", err);
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = SponsorController;
