// routes/teachers.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/teacherController');

router.get('/', ctrl.getAll);
router.get('/:mgv', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:mgv', ctrl.update);
router.delete('/:mgv', ctrl.remove);

module.exports = router;
