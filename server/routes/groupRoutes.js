const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/groupController');

router.get('/', ctrl.getAll);
router.get('/:manhom', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:manhom', ctrl.update);
router.delete('/:manhom', ctrl.remove);

module.exports = router;
