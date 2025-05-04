const express = require('express');
const router = express.Router();
const dkCtrl = require('../controllers/dangkyController');

router.get('/', dkCtrl.getAll);
router.get('/:msv', dkCtrl.getByStudent);
router.post('/', dkCtrl.create);
router.put('/:id', dkCtrl.update);
router.delete('/:id', dkCtrl.remove);

module.exports = router;
