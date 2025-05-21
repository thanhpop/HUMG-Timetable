// server/controllers/lichhocController.js
const Schedule = require('../models/lichhocModel');
const DangKy = require('../models/dangkyModel');

exports.getAll = async (req, res, next) => {
    try {
        const [rows] = await Schedule.findAll();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const [rows] = await Schedule.findById(req.params.id);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

exports.getByGroup = async (req, res, next) => {
    try {
        const [rows] = await Schedule.findByGroup(req.params.manhom);
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { manhom, thu, tietbd, tietkt, ngaybd, ngaykt, maphong } = req.body;
        if (!manhom || thu == null || tietbd == null || tietkt == null || !ngaybd || !ngaykt || !maphong) {
            return res.status(400).json({ error: 'Missing fields' });
        }
        const [result] = await Schedule.create({ manhom, thu, tietbd, tietkt, ngaybd, ngaykt, maphong });
        const [[newRow]] = await Schedule.findById(result.insertId);
        res.status(201).json(newRow);
    } catch (err) {
        next(err);
    }
};


exports.update = async (req, res, next) => {
    try {
        const { manhom, thu, tietbd, tietkt, ngaybd, ngaykt, maphong } = req.body;
        const [result] = await Schedule.update(req.params.id, { manhom, thu, tietbd, tietkt, ngaybd, ngaykt, maphong });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        const [[updated]] = await Schedule.findById(req.params.id);
        res.json(updated);
    } catch (err) {
        next(err);
    }
};
exports.remove = async (req, res, next) => {
    const id = req.params.id;
    try {
        // 1) xóa tất cả đăng ký tham chiếu tới lichhoc_id = id
        await DangKy.removeByLichHoc(id);

        // 2) xóa bản ghi lịch học
        const [result] = await Schedule.remove(id);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted lịch và tất cả đăng ký liên quan' });
    } catch (err) {
        next(err);
    }
};


exports.getByTeacher = async (req, res, next) => {
    try {
        const mgv = req.params.mgv;
        const [rows] = await Schedule.findByTeacher(mgv);
        res.json(rows);
    } catch (err) {
        next(err);
    }
};


exports.getBySemester = async (req, res, next) => {
    try {
        const mahk = req.params.mahk;
        const [rows] = await Schedule.findBySemester(mahk);
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.deleteBySemester = async (req, res, next) => {
    const { mahk } = req.params;
    try {
        // 1) tìm tất cả manhom của học kỳ này
        const [[{ count }]] = await Schedule.getCountGroupsBySemester(mahk);
        if (count === 0) {
            return res.status(404).json({ message: 'Chưa có lịch cho học kỳ này' });
        }
        // 2) xoá tất cả đăng ký liên quan và lịch học
        await Schedule.deleteBySemester(mahk);
        res.json({ message: `Đã xóa ${count} lịch học của học kỳ ${mahk}` });
    } catch (err) {
        next(err);
    }
};