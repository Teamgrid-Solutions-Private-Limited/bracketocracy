// const express = require('express');
// const router = express.Router();

// const { sendEmail } = require('../controllers/emailController');


// router.post("/mail",sendEmail);

// module.exports = router;

const express = require('express');
const router = express.Router();

// Importing the instance of EmailController
const emailController = require('../controllers/emailController');

// Define route and attach sendEmail method
router.post('/mail', (req, res) => emailController.sendEmail(req, res));

module.exports = router;
