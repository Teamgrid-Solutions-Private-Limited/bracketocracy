const express=require('express');
 const   LC = require('../controllers/LeagueController');


const router = express.Router();
router.post('/create',LC.addLeague);
router.get('/show',LC.viewAll);
router.get('/search/:id',LC.searchLeague);
router.delete('/delete/:id',LC.leagueDelete);
router.put('/update/:id',LC.updateLeague);


module.exports=router;