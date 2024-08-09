const Sponsor = require("../model/sponsorSchema");
const upload = require("../middleware/fileUpload");

const BASE_URL = "http://localhost:6010/";
const upload_URL = BASE_URL + "my-uploads/";

class sponsorController {
  static addSponsor = async (req, res) => {
    try {
      upload.single("logo")(req, res, async (err) => {
        if (err) {
          console.error("Error uploading file:", err);
          return res.status(400).json({ message: "Error uploading file" });
        }

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
            logo: `${upload_URL}${req.file.filename}`,
          });

          const result = await sponsor.save();
          res
            .status(201)
            .json({ message: "sponsor added successfully", result });
        } catch (err) {
          res.status(500).json({ message: err.messages });
        }
      });
    } catch (err) {
      console.error("Error in adding function:", err);
      res.status(500).json({ message: "Error creating sponsor" });
    }
  };

  static deleteSponsor = async (req, res) => {
    try {
      const sponsorid = req.params.id;
      const result = await Sponsor.findByIdAndDelete(sponsorid);
      res
        .status(200)
        .json({ message: "sponsor deleted successfully", info: result });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };
  static displayAll(req, res) {
    Sponsor.find().then((data) => {
      res.status(200).json({
        message: "sponsor list retrieved successfully!",
        sponsors: data,
      });
    });
  }
  static displayById(req, res) {
    Sponsor.findById({ _id: req.params.id }).then((data) => {
      res.status(200).json({
        message: "sponsor related to id  retrieved successfully!",
        sponsor: data,
      });
    });
  }
  static updateSponsor = async (req, res) => {
    try {
      const { id } = req.params;
      const update = req.body;
       

      // Find the sponsor by ID and update its data
      const updatedSponsor = await Sponsor.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true }
      );

      if (!updatedSponsor) {
        res.status(404).json({ error: "sponsor not found" });
        return;
      }

      res
        .status(200)
        .json({ message: "Update done successfully", info: updatedSponsor });
    } catch (err) {
      res.status(500).json({ msg: "this error",error: err.message });
    }
  };
}
module.exports = sponsorController;
