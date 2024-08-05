const express = require('express');
const router = express.Router();
const MC = require('../controllers/messageController');

 

// Route to add a new message
router.post('/leagues/:leagueId/messages', MC.addMessage);

// Route to get all messages for a league
router.get('/leagues/:leagueId/messages', MC.showAllMessages);

// // Route to delete a message by ID
// router.delete('/messages/:id', MC.deleteMessage);

module.exports = router;
