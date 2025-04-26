// routes/students.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studentController');

router.get('/', ctrl.getAll);
router.get('/:msv', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:msv', ctrl.update);
router.delete('/:msv', ctrl.remove);

module.exports = router;
