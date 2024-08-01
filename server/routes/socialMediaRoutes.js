const express = require('express');
const router = express.Router();
 
const {addSocial, showAll, socialDelete, updateSocial, searchSocial} = require('../controllers/SocialmediaController');



 

router.post('/create',addSocial);
router.get('/view',showAll);
router.get('/viewBy/:id', searchSocial);
router.put('/:id',updateSocial);
router.delete('/:id',socialDelete);

module.exports = router;