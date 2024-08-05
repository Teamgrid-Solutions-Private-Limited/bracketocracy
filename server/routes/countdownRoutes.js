const express=require('express');
const { updateCount, countDelete, searchById, viewAll, addCountdown } = require('../controllers/countdownController');
 


const router = express.Router();
router.post('/create',addCountdown);
router.get('/show',viewAll);
router.get('/search/:id',searchById);
router.delete('/delete/:id',countDelete);
router.put('/update/:id',updateCount);


module.exports=router;