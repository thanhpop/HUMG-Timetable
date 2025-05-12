// server/routes/lichhoc.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/lichhocController');


router.get('/nhom/:manhom', ctrl.getByGroup);
router.get('/gv/:mgv', ctrl.getByTeacher);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);



module.exports = router;
