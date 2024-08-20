const express=require('express');
 const   LC = require('../controllers/leagueController');


const router = express.Router();
router.post('/league/create',LC.addLeague);
router.get('/league/show',LC.viewAll);
router.get('/league/search/:id',LC.searchLeague);
router.delete('/league/delete/:id',LC.leagueDelete);
router.put('/league/update/:id',LC.updateLeague);


module.exports=router;