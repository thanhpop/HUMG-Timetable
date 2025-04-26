// controllers/courseController.js
const Course = require('../models/courseModel');

exports.getAll = async (req, res, next) => {
    try {
        const [rows] = await Course.findAll();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const [rows] = await Course.findById(req.params.mamh);
        if (!rows.length) return res.status(404).json({ error: 'Không tìm thấy môn học' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { mamh, tenmh, sotinchi, khoa } = req.body;
        if (!mamh || !tenmh || !sotinchi || !khoa) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        await Course.create({ mamh, tenmh, sotinchi, khoa });
        const [[newCourse]] = await Course.findById(mamh);
        res.status(201).json(newCourse);
    } catch (err) {
        // Nếu duplicate mamh thì báo lỗi rõ hơn
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Mã môn học đã tồn tại' });
        }
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { tenmh, sotinchi, khoa } = req.body;
        const mamh = req.params.mamh;

        const [result] = await Course.update(mamh, { tenmh, sotinchi, khoa });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy môn học' });

        const [[updated]] = await Course.findById(mamh);
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const mamh = req.params.mamh;
        const [result] = await Course.remove(mamh);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy môn học' });
        res.json({ message: 'Đã xóa thành công' });
    } catch (err) {
        next(err);
    }
};
