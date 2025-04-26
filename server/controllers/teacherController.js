// controllers/teacherController.js
const Teacher = require('../models/teacherModel');

exports.getAll = async (req, res, next) => {
    try {
        const [rows] = await Teacher.findAll();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const mgv = req.params.mgv;              // lấy mgv từ params
        const [rows] = await Teacher.findById(mgv);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { mgv, ten, khoa, email, sdt, gioitinh } = req.body;
        if (!mgv || !ten || !khoa) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // tạo mới
        await Teacher.create({ mgv, ten, khoa, email, sdt, gioitinh });
        // đọc lại record vừa tạo
        const [newRowArr] = await Teacher.findById(mgv);
        res.status(201).json(newRowArr[0]);
    } catch (err) {
        // xử lý duplicate key
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Mã giảng viên đã tồn tại' });
        }
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const mgv = req.params.mgv;
        const { ten, khoa, email, sdt, gioitinh } = req.body;
        const [result] = await Teacher.update(mgv, { ten, khoa, email, sdt, gioitinh });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        const [updatedArr] = await Teacher.findById(mgv);
        res.json(updatedArr[0]);
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const mgv = req.params.mgv;
        const [result] = await Teacher.remove(mgv);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        next(err);
    }
};
