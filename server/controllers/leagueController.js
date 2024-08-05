const League = require("../model/leagueSchema");
const User = require('../model/userSchema');

class leagueController {
  static addLeague = async (req, res) => {
    try {

      const user = await User.findById(req.body.userId);
      if (!user) {
        return res.status(404).json({ message: "user  id not found" });
      }
      const { title, description, userId } = req.body;
      if (!title) {
        res.status(400).json({ error: "title is required" });
      }
      if (!description) {
        res.status(400).json({ error: "description is required" });
      }

      const league = new League({ title, description, userId });
      const data = await league.save();
      res.status(201).json({ message: "league created successfull", info: data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }

  }

  static viewAll = async (req, res) => {
    try {
      const data = await League.find();
      res.status(201).json({ message: "view successful", info: data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  // search league by id
  static searchLeague = async (req, res) => {
    try {
      let leagueId = req.params.id;
      const result = await League.findById(leagueId);
      res.status(201).json({ data: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  // delete a league by id
  static leagueDelete = async (req, res) => {
    try {
      const data = req.params.id;
      const result = await League.findByIdAndDelete(data);
      res
        .status(201)
        .json({ message: "league deleted successfully", info: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  // update a league by id 
  // static updateleague = async (req, res) => {
  //   try {
  //     const leagueid = req.params.id;
  //     const data = req.body;
  //     const leaguedata = await League.findById(leagueid);
  //     leaguedata.title = data.title;
  //     leaguedata.description = data.description;


  //     const update = await leaguedata.save();
  //     res
  //       .status(200)
  //       .json({ message: "update done successfully", info: update });
  //   } catch (err) {
  //     res.status(404).json({ error: err.message });
  //   }
  // };

  static updateLeague = async (req, res) => {
    try {
      const { id } = req.params;
      const update = req.body;

      // Find the league by ID and update its data
      const updatedLeague = await League.findByIdAndUpdate(id, { $set: update }, { new: true });

      if (!updatedLeague) {
        res.status(404).json({ error: 'League not found' });
        return;
      }

      res.status(201).json({ message: 'Update done successfully', info: updatedLeague });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = leagueController;