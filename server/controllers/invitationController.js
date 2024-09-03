const Invite = require("../model/leagueInvitationSchema");
const League = require("../model/leagueSchema");
const User = require("../model/userSchema");

class invitationController {
  static addInvitation = async (req, res) => {
    try {
      const { email } = req.body;
       
      const { leagueId } = req.params; // Assuming leagueId is in params
      const league = await League.findById(leagueId);
       
      if (!league) {
        return res.status(404).json({ message: "League not found." });
      }

      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res
          .status(404)
          .json({ message: "No user found with this email." });
      }

      // Create an invitation
      const invitation = new Invite({
        email,
        userId: user.id,
        invitedBy: league.userId[0],
        leagueId,
      });

      // Save the invitation
      const savedInvitation = await invitation.save();
      if (!Array.isArray(league.userId)) {
        league.userId = [];
      }

      if(!Array.isArray(league.emails))
      {
        league.emails=[];
      }

      // // Add the userId to league's userId array

      league.userId.push(user.id);
      league.emails.push(email);

      // Save the league
      await league.save();

      res.status(200).json({
        message: "Invitation added successfully.",
        invitationData: savedInvitation,
        leagueData: league,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: err.message });
    }
  };


  static showAll = async (req, res) => {
    try {
      // let inviteid = req.params.id;
      const result = await Invite.find();
      res.status(200).json({ message: "retrive successfully", data: result });
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  };
  // static searchleague = async (req, res) => {
  //   try {
  //     let leagueid = req.params.id;
  //     const result = await League.findById(leagueid);
  //     res.status(200).json({ data: result });
  //   } catch (err) {
  //     res.status(404).json({ error: err.message });
  //   }
  // };

  // static deleteinvite = async (req, res) => {
  //   try {
  //     const data = req.params.id;
  //     const result = await Invite.findByIdAndDelete(data);
  //     res
  //       .status(200)
  //       .json({ message: "invitation deleted successfully", info: result });
  //   } catch (err) {
  //     res.status(404).json({ error: err.message });
  //   }
  // }

  static deleteInvite = async (req, res) => {
    try {
      const inviteId = req.params.id;

      // Find the invitation to get associated leagueId and userId
      const invitation = await Invite.findById(inviteId);
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found." });
      }

      // Get leagueId and userId from the invitation
      const { leagueId, userId } = invitation;

      // Delete the invitation
      const result = await Invite.findByIdAndDelete(inviteId);
      if (!result) {
        return res
          .status(500)
          .json({ message: "Failed to delete invitation." });
      }

      // Find the league
      const league = await League.findById(leagueId);
      if (!league) {
        return res.status(404).json({ message: "League not found." });
      }

      // Remove userId from league's userId array
      if (Array.isArray(league.userId)) {
        league.userId = league.userId.filter(
          (id) => id.toString() !== userId.toString()
        );
      }

      // Save the updated league document
      await league.save();

      res.status(200).json({
        message:
          "Invitation deleted successfully and user removed from league.",
        info: result,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}

module.exports = invitationController;
