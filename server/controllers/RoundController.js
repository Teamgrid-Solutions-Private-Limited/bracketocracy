const Round = require("../model/roundSchema");
const Season = require("../model/seasonSchema");
const slugify = require("slugify");

class roundController {
  static addRound = async (req, res) => {
    try {
      const season = Season.findById(req.body.seasonId);
      if (!season) {
        return res.status(404).json({ message: "season id not found" });
      }

      const { name, playDate, biddingEndDate, totalMatch, seasonId } = req.body;
      if (!name) {
        console.log(name);
        return res.status(400).json({ error: "Name  is required" });
      }
      const slug = slugify(name);
      const round = new Round({
        name,
        slug,
        playDate,
        biddingEndDate,
        totalMatch,
        seasonId,
      });
      const result = await round.save();
      res
        .status(201)
        .json({ message: "Zone created successfully", data: result });
    } catch (error) {
      console.error(error);
      res.status(404).json({ error: "Internal Server Error" });
    }
  };
  //get all round------------
  static viewRound = async (req, res) => {
    try {
      const roundList = await Round.find().exec();
      res.json(roundList);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error fetching roles", error: error.message });
    }
  };

  static deleteRound = async (req, res) => {
    try {
      const roundId = req.params.id;
      if (!roundId) {
        return res.status(400).json({ message: "round ID is required" });
      }

      const user = await Round.deleteOne({ _id: roundId });
      if (user.deletedCount === 0) {
        return res.status(404).json({ message: "round not found" });
      }

      res.json({ message: "round deleted successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error deleting round", error: error.message });
    }
  };

  static updateRound = async (req, res) => {
    try {
      const roundId = req.params.id;
      const data = req.body;
      const roundData = await Round.findById(roundId);
      roundData.name = data.name;
      roundData.totalMatch = data.totalMatch;

      const update = await roundData.save();
      res
        .status(200)
        .json({ message: "update done successfully", info: update });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };

  static searchRoundBySlug = async (req, res) => {
    try {
      const slug = req.params.slug;
      const round = await Round.findOne({ slug });
      if (!round) {
        res.status(404).send({ message: "round not found" });
      } else {
        res.send(round);
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Error fetching round" });
    }
  };
  static searchRoundById = async (req, res) => {
    try {
      let roundId = req.params.id;
      const result = await Round.findById(roundId);
      res.status(200).json({ data: result });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };
}

module.exports = roundController;
