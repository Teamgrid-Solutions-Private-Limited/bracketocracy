const express = require('express');
const passport = require('passport');
const router = express.Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', passport.authenticate('google'), (req, res) => {
  // Successful authentication, redirect home.
  res.redirect('/');
});

// Facebook OAuth routes
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email','public_profile']
}));

router.get('/facebook/callback', passport.authenticate('facebook'), (req, res) => {
  // Successful authentication, redirect home.
  res.redirect('/');
});

// Logout route
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Current user route
router.get('/current_user', (req, res) => {
  res.send(req.user);
});

module.exports = router;
