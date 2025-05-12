// server/controllers/dangkyController.js
const Registration = require('../models/dangkyModel');
const LichHoc = require('../models/lichhocModel');
exports.getAll = async (req, res, next) => {
    try {
        const [rows] = await Registration.findAll();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.getByStudent = async (req, res, next) => {
    try {
        const msv = req.params.msv;
        const [rows] = await Registration.findByStudent(msv);
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { msv, lichhoc_id } = req.body;
        if (!msv || !lichhoc_id) {
            return res.status(400).json({ error: 'msv and lichhoc_id are required' });
        }

        // 1) Lấy thông tin buổi học muốn đăng ký
        const [lh] = await LichHoc.findById(lichhoc_id);
        if (!lh) return res.status(404).json({ error: 'Buổi học không tồn tại' });

        const capacity = lh.succhua;

        // 2) Kiểm tra xem buổi học đã đầy chưa
        const currentCount = await Registration.countFor(lichhoc_id);
        if (currentCount >= capacity) {
            return res.status(400).json({ error: 'Buổi học đã hết chỗ.' });
        }

        // 3) Lấy tất cả buổi học mà sinh viên đã đăng ký
        const [existingSessions] = await LichHoc.findByStudentSchedules(msv);

        // 4) Kiểm tra xung đột lịch
        const conflict = existingSessions.some(s => {
            return s.thu === lh.thu && !(s.tietkt < lh.tietbd || s.tietbd > lh.tietkt);
        });

        if (conflict) {
            return res.status(400).json({ error: 'Xung đột lịch: buổi này trùng với một buổi bạn đã đăng ký.' });
        }

        // 5) Nếu không xung đột, tạo đăng ký
        const [result] = await Registration.create({ msv, lichhoc_id });
        const [[newRow]] = await Registration.findById(result.insertId);
        res.status(201).json(newRow);


    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { msv, lichhoc_id } = req.body;
        const [result] = await Registration.update(id, { msv, lichhoc_id });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        const [[updated]] = await Registration.findById(id);
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const id = req.params.id;
        const [result] = await Registration.remove(id);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        next(err);
    }
};

exports.countByLichHoc = async (req, res, next) => {
    try {
        const [rows] = await Registration.countByLichHoc();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};