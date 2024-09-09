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
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      // Redirect to Google’s logout URL
      res.redirect('https://accounts.google.com/Logout');
    });
  });
});
// router.get('/logout', (req, res) => {
//   req.logout();
//   res.redirect('/');
// });

// Current user route
router.get('/current_user', (req, res) => {
  res.send(req.user);
});

// Route to start the Apple sign-in process
router.get('/auth/apple',
  passport.authenticate('apple', { scope: ['name', 'email'] })
);

// Callback route after Apple authentication
router.get('/auth/apple/callback',passport.authenticate('apple', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication
    res.redirect('/profile');
  }
);

module.exports = router;
