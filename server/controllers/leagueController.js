const League = require("../model/leagueSchema");
const User = require("../model/userSchema");
const LeagueInvitation = require('../model/leagueInvitationSchema');
const mongoose = require('mongoose');
 

class leagueController {

  static addLeague = async (req, res) => {
    const { title, emails,userId,allowInvitation} = req.body;
    // const userId =req.user.id;

    if (!title || !userId) {
      console.log(title,userId);
      return res.status(400).json({
        error: "Title  and userId are required",
      });
    }

     
    const emailArray = Array.isArray(emails) ? emails : (emails ? [emails] : []);

    try {
       
      
        let savedLeague;
      
      
      

       
      if (emailArray.length > 0) {
         
        const users = await User.find({ email: { $in: emailArray } });

         
        const foundEmails = users.map(user => user.email);
        const notFoundEmails = emailArray.filter(email => !foundEmails.includes(email));

        if (notFoundEmails.length > 0) {
          return res.status(404).json({
            message: "Some users not found for emails: " + notFoundEmails.join(', '),
          });
        }

        const league = new League({ title, userId, emails: foundEmails,allowInvitation });
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
        
        const league = new League({ title, userId,allowInvitation});
          savedLeague = await league.save();
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
    const { emails,title,allowInvitation } = req.body;
    const { id } = req.params;

    if (!id || !emails) {
        return res.status(400).json({
            error: "leagueId and emails are required",
        });
    }

    const emailArray = Array.isArray(emails) ? emails : [emails];

    try {
        // Find the original league
        const originalLeague = await League.findById(id);
        if (!originalLeague) {
            return res.status(404).json({
                error: "League not found",
            });
        }

        // Find users for the updated email list
        const newUsers = await User.find({ email: { $in: emailArray } });
        const newUserIds = newUsers.map(user => user._id);

        // Find users to be removed from the league
        const originalEmails = originalLeague.emails;
        const removedEmails = originalEmails.filter(email => !emailArray.includes(email));
        const removedUsers = await User.find({ email: { $in: removedEmails } });
        const removedUserIds = removedUsers.map(user => user._id);

        // First, remove the user IDs that are no longer in the email list
        await League.updateOne({ _id: id }, { $pull: { userId: { $in: removedUserIds } } });

        // Then, add the new user IDs
        const league = await League.findByIdAndUpdate(id, {
            $addToSet: { userId: { $each: newUserIds } },
            emails: emailArray,
            title,
            allowInvitation
        }, { new: true });

        res.status(200).json({
            message: "Update done successfully",
            info: league,
        });
    } catch (err) {
        res.status(500).json({
            error: "An unexpected error occurred",
            details: err.message,
        });
    }
};

// static updateLeague = async (req, res) => {
//   const { emails } = req.body;
//   const { id } = req.params;

//   if (!id || !emails) {
//       return res.status(400).json({
//           error: "leagueId and emails are required",
//       });
//   }

//   const emailArray = Array.isArray(emails) ? emails : [emails];

//   try {
//       // Find the league to update
//       const league = await League.findById(id);
//       if (!league) {
//           return res.status(404).json({
//               error: "League not found",
//           });
//       }

//       // Find users for the updated email list
//       const newUsers = await User.find({ email: { $in: emailArray } });
//       const newUserIds = newUsers.map(user => user._id);

//       // Find existing users in the league
//       const existingUsers = await User.find({ _id: { $in: league.userId } });
//       const existingUserIds = existingUsers.map(user => user._id);

//       // Update the league's userId array
//       const updatedUserIds = [...new Set([...existingUserIds, ...newUserIds])];
//       league.userId = updatedUserIds.filter((value, index, self) => self.indexOf(value) === index);

//       // Update the league's emails
//       league.emails = emailArray;

//       // Save the updated league
//       await league.save();

//       res.status(200).json({
//           message: "Update done successfully",
//           info: league,
//       });
//   } catch (err) {
//       res.status(500).json({
//           error: "An unexpected error occurred",
//           details: err.message,
//       });
//   }
// };
 
 

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
