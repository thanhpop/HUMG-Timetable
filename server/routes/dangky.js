const express = require('express');
const router = express.Router();
const dkCtrl = require('../controllers/dangkyController');

// Route mới để đếm số lượng đăng ký theo lichhoc_id
router.get('/count-by-lichhoc', dkCtrl.countByLichHoc);
router.get('/', dkCtrl.getAll);
router.get('/:msv', dkCtrl.getByStudent);
router.post('/', dkCtrl.create);
router.put('/:id', dkCtrl.update);
router.delete('/:id', dkCtrl.remove);
router.get('/group/:manhom', dkCtrl.getByGroup);


module.exports = router;