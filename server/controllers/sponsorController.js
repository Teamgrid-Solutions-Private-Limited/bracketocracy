const Sponsor = require("../model/sponsorSchema");
const upload = require("../middleware/fileUpload");

const BASE_URL = "http://localhost:6010/";
const upload_URL = BASE_URL + "images/";

class SponsorController {
  static handleError = (
    res,
    error,
    message = "Internal Server Error",
    status = 500
  ) => {
    console.error(message, error);
    res.status(status).json({ error: message });
  };

  static handleFileUpload = (req, res, next) => {
    upload.single("logo")(req, res, (err) => {
      if (err) {
        return SponsorController.handleError(
          res,
          err,
          "Error uploading file",
          400
        );
      }
      next();
    });
  };

  static addSponsor = async (req, res) => {
    try {
      SponsorController.handleFileUpload(req, res, async () => {
        const { companyName, website } = req.body;

        if (!companyName || !website) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        try {
          const sponsor = new Sponsor({
            companyName,
            website,
            logo: req.file ? `${upload_URL}${req.file.filename}` : undefined,
          });

          const result = await sponsor.save();
          res
            .status(201)
            .json({ message: "Sponsor added successfully", data: result });
        } catch (err) {
          SponsorController.handleError(res, err, "Error saving sponsor");
        }
      });
    } catch (err) {
      SponsorController.handleError(res, err, "Error in addSponsor function");
    }
  };

  static deleteSponsor = async (req, res) => {
    try {
      const sponsorId = req.params.id;
      const result = await Sponsor.findByIdAndDelete(sponsorId);

      if (!result) {
        return res.status(404).json({ error: "Sponsor not found" });
      }

      res
        .status(200)
        .json({ message: "Sponsor deleted successfully", data: result });
    } catch (err) {
      SponsorController.handleError(res, err, "Error deleting sponsor");
    }
  };

  static displayAll = async (req, res) => {
    try {
      const data = await Sponsor.find();
      res
        .status(200)
        .json({ message: "Sponsor list retrieved successfully", data });
    } catch (err) {
      SponsorController.handleError(res, err, "Error retrieving sponsors");
    }
  };

  static displayById = async (req, res) => {
    try {
      const data = await Sponsor.findById(req.params.id);

      if (!data) {
        return res.status(404).json({ error: "Sponsor not found" });
      }

      res.status(200).json({ message: "Sponsor retrieved successfully", data });
    } catch (err) {
      SponsorController.handleError(res, err, "Error retrieving sponsor by ID");
    }
  };

  static updateSponsor = async (req, res) => {
    try {
      // Handle file upload before processing the update
      SponsorController.handleFileUpload(req, res, async () => {
        const { id } = req.params;
        const update = req.body;

        // Find the sponsor by ID
        const sponsor = await Sponsor.findById(id);

        if (!sponsor) {
          return res.status(404).json({ error: "Sponsor not found" });
        }

        // Update fields if present
        sponsor.companyName = update.companyName || sponsor.companyName;
        sponsor.website = update.website || sponsor.website;

        // Update logo if a new file is uploaded
        if (req.file) {
          sponsor.logo = `${upload_URL}${req.file.filename}`;
        }

        const updatedSponsor = await sponsor.save();
        res
          .status(200)
          .json({
            message: "Sponsor updated successfully",
            data: updatedSponsor,
          });
      });
    } catch (err) {
      SponsorController.handleError(res, err, "Error updating sponsor");
    }
  };
}

module.exports = SponsorController;
