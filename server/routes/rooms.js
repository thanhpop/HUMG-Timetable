// routes/rooms.js

const express = require('express');
const router = express.Router();
const roomCtrl = require('../controllers/roomController');

// GET   /phonghoc          → Lấy danh sách tất cả phòng học
router.get('/', roomCtrl.getAll);

// GET   /phonghoc/:maphong → Lấy chi tiết phòng học theo maphong
router.get('/:maphong', roomCtrl.getOne);

// POST  /phonghoc          → Tạo mới phòng học
router.post('/', roomCtrl.create);

// PUT   /phonghoc/:maphong → Cập nhật phòng học
router.put('/:maphong', roomCtrl.update);

// DELETE /phonghoc/:maphong → Xóa phòng học
router.delete('/:maphong', roomCtrl.remove);

module.exports = router;
