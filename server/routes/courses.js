// routes/monhoc.js   (trước đây là routes/courses.js)
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/courseController');

// Lấy tất cả môn học
router.get('/', ctrl.getAll);

// Lấy chi tiết môn học theo mã môn học (mamh)
router.get('/:mamh', ctrl.getOne);

// Tạo mới môn học
router.post('/', ctrl.create);

// Cập nhật môn học theo mamh
router.put('/:mamh', ctrl.update);

// Xóa môn học theo mamh
router.delete('/:mamh', ctrl.remove);

module.exports = router;
