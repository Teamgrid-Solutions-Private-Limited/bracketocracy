const express = require('express');
const router = express.Router();
const MC = require('../controllers/messageController');
const checkUser = require('../middleware/checkUser');

 

// Route to add a new message
router.post('/message/leagues/:leagueId/messages',checkUser, MC.addMessage);

// Route to get all messages for a league
router.get('/message/leagues/:leagueId/messages', MC.showAllMessages);

// // Route to delete a message by ID
// router.delete('/messages/:id', MC.deleteMessage);

module.exports = router;
