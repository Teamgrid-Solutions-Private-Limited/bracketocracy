const League = require("../model/leagueSchema");
const User = require("../model/userSchema");
const LeagueInvitation = require('../model/leagueInvitationSchema');
const mongoose = require('mongoose');
 

class leagueController {

  static addLeague = async (req, res) => {
    const { title, emails,userId} = req.body;
    // const userId =req.user.id;

    if (!title || !userId) {
      console.log(title,userId);
      return res.status(400).json({
        error: "Title  and userId are required",
      });
    }

     
    const emailArray = Array.isArray(emails) ? emails : (emails ? [emails] : []);

    try {
       
      

      
      
      

       
      if (emailArray.length > 0) {
         
        const users = await User.find({ email: { $in: emailArray } });

         
        const foundEmails = users.map(user => user.email);
        const notFoundEmails = emailArray.filter(email => !foundEmails.includes(email));

        if (notFoundEmails.length > 0) {
          return res.status(404).json({
            message: "Some users not found for emails: " + notFoundEmails.join(', '),
          });
        }

        const league = new League({ title, userId, emails: foundEmails });
        const savedLeague = await league.save();

         
        const invitations = users.map(user => ({
          email: user.email,
          userId: user._id,
          invitedBy: league.userId[0],  
          leagueId: savedLeague._id,
        }));

        // Save invitations
        await LeagueInvitation.insertMany(invitations);

        // Add the user IDs to the league's userId array
        savedLeague.userId.push(...users.map(user => user._id));
        await savedLeague.save();

        res.status(201).json({
          message: "League created successfully and invitations sent",
          info: {
            league: savedLeague,
            invitations,
          },
        });
      } else {
        res.status(201).json({
          message: "League created successfully without invitations",
          info: savedLeague,
        });
      }
    } catch (err) {
      res.status(500).json({
        error: "An unexpected error occurred",
        details: err.message,
      });
    }
  };

  // static addLeague = async (req, res) => {
  //   const { title, description, userId } = req.body;
  //   if (!title || !description || !userId) {
  //     return res.status(400).json({
  //       error: "All fields (title, description, userId) are required",
  //     });
  //   }
  //   try {
  //     const user = await User.findById(userId);
  //     if (!user) {
  //       return res.status(404).json({ message: "User not found" });
  //     }

  //     const data = await new League({ title, description, userId }).save();
  //     res
  //       .status(201)
  //       .json({ message: "League created successfully", info: data });
  //   } catch (err) {
  //     res
  //       .status(500)
  //       .json({ error: "An unexpected error occurred", details: err.message });
  //   }
  // };

  static viewAll = async (req, res) => {
    try {
      const data = await League.find();
      res.status(201).json({ message: "view successful", info: data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  // static searchLeague = async (req, res) => {
  //   try {
  //     let leagueId = req.params.id;
  //     const result = await League.findById(leagueId);
  //     res.status(201).json({ data: result });
  //   } catch (err) {
  //     res.status(500).json({ error: err.message });
  //   }
  // };
  static searchLeague = async (req, res) => {
    try {
       
      const userId = req.params.id || req.query.userId;

      
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid user ID format" });
      }

       
      const leagues = await League.find({ userId: userId });

      // Check if any leagues were found
      if (leagues.length === 0) {
        return res.status(404).json({ message: "No leagues found for this user" });
      }

      
      res.status(200).json({ data: leagues });
    } catch (err) {
     
      res.status(500).json({ error: err.message });
    }
  };

  

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

  static updateLeague = async (req, res) => {
    try {
      const { id } = req.params;
      const update = req.body;

      // Find the league by ID and update its data
      const updatedLeague = await League.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true }
      );

      if (!updatedLeague) {
        res.status(404).json({ error: "League not found" });
        return;
      }

      res
        .status(201)
        .json({ message: "Update done successfully", info: updatedLeague });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  static deleteUser = async (req, res) => {
    const { leagueId, userId } = req.body;

    if (!leagueId || !userId) {
      return res.status(400).json({
        error: "League ID and User ID are required",
      });
    }

    try {
      // Find the league by its ID
      const league = await League.findById(leagueId);

      if (!league) {
        return res.status(404).json({
          error: "League not found",
        });
      }

      // Remove the userId from the userId array
      const userIndex = league.userId.indexOf(userId);
      if (userIndex > -1) {
        league.userId.splice(userIndex, 1);
      }

      // Find the user's email
      const user = await User.findById(userId);
      if (user) {
        // Remove the user's email from the emails array
        const emailIndex = league.emails.indexOf(user.email);
        if (emailIndex > -1) {
          league.emails.splice(emailIndex, 1);
        }
      }

      // Save the updated league document
      await league.save();

      res.status(200).json({
        message: "User successfully removed from league",
        league: league,
      });
    } catch (error) {
      res.status(500).json({
        error: "An unexpected error occurred",
        details: error.message,
      });
    }
  };
}

module.exports = leagueController;
