const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/roomController');

router.get('/', ctrl.getAll);
router.get('/:maphong', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:maphong', ctrl.update);
router.delete('/:maphong', ctrl.remove);

module.exports = router;
