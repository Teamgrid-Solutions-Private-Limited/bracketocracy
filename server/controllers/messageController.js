const Message = require("../model/messageSchema");
const League = require("../model/leagueSchema");

class messageController {
  static addMessage = async (req, res) => {
    try {
      const { leagueId } = req.params;
      const { userId, message } = req.body;

      if (!leagueId || !userId || !message) {
        return res
          .status(400)
          .json({ error: "League ID, user ID, and message are required" });
      }

      const league = await League.findById(leagueId);
      if (!league || !league.userId.includes(userId)) {
        return res
          .status(league ? 403 : 404)
          .json({
            message: league
              ? "User is not a member of this league."
              : "League not found.",
          });
      }

      const savedMessage = new Message({ leagueId, userId, message }).save();

      res
        .status(201)
        .json({ message: "Message sent successfully.", data: savedMessage });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: err.message });
    }
  };

  // Show all messages for a league
  static showAllMessages = async (req, res) => {
    try {
      const { leagueId } = req.params;

      // Find the league
      const league = await League.findById(leagueId);
      if (!league) {
        return res.status(404).json({ message: "League not found." });
      }

      // Find all messages for the league
      const messages = await Message.find({ leagueId });

      res.status(200).json({
        message: "Messages retrieved successfully.",
        data: messages,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: err.message });
    }
  };

  // Delete a message by ID
  //   static deleteMessage = async (req, res) => {
  //     try {
  //       const { id } = req.params;

  //       // Find and delete the message
  //       const deletedMessage = await Message.findByIdAndDelete(id);
  //       if (!deletedMessage) {
  //         return res.status(404).json({ message: 'Message not found.' });
  //       }

  //       res.status(200).json({
  //         message: 'Message deleted successfully.',
  //         data: deletedMessage
  //       });
  //     } catch (err) {
  //       console.error(err.message);
  //       res.status(500).json({ message: err.message });
  //     }
  //   }
}

module.exports = messageController;
