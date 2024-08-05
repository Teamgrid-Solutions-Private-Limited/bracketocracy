const express = require('express');
const router = express.Router();
 
const {addSocial, showAll, socialDelete, updateSocial, searchSocial} = require('../controllers/socialmediaController');



 

router.post('/create',addSocial);
router.get('/view',showAll);
router.get('/viewBy/:id', searchSocial);
router.put('/update/:id',updateSocial);
router.delete('/delete/:id',socialDelete);

module.exports = router;