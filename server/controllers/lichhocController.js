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
        const { manhom, thu, tietbd, tietkt, ngaybd, ngaykt } = req.body;
        // simple validation
        if (!manhom || thu == null || tietbd == null || tietkt == null || !ngaybd || !ngaykt) {
            return res.status(400).json({ error: 'Missing fields' });
        }
        const [result] = await Schedule.create({ manhom, thu, tietbd, tietkt, ngaybd, ngaykt });
        const [[newRow]] = await Schedule.findById(result.insertId);
        res.status(201).json(newRow);
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { manhom, thu, tietbd, tietkt, ngaybd, ngaykt } = req.body;
        const [result] = await Schedule.update(req.params.id, { manhom, thu, tietbd, tietkt, ngaybd, ngaykt });
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

exports.getAll = async (req, res, next) => {
    try {
        const [rows] = await Schedule.findAll();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};