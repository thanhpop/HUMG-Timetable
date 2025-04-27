const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/semesterController');

router.get('/', ctrl.getAll);
router.get('/:mahk', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:mahk', ctrl.update);
router.delete('/:mahk', ctrl.remove);

module.exports = router;
