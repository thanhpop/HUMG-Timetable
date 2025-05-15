const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tkbController');

router.post('/', ctrl.createTimetable);

module.exports = router;
