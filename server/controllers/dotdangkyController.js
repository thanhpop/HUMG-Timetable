// File: controllers/dotdangkyController.js
const DotDK = require('../models/dotdangkyModel');

exports.getAll = async (req, res, next) => {
    try {
        const [rows] = await DotDK.findAll();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};
// Lấy đợt hiện tại (NOW() trong khoảng)
exports.getCurrent = async (req, res, next) => {
    try {
        const [rows] = await DotDK.findCurrent();
        if (!rows.length) {
            // không có đợt hợp lệ
            return res.status(404).json({ error: 'Không có đợt đăng ký đang mở.' });
        }
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};
exports.getOne = async (req, res, next) => {
    try {
        const [rows] = await DotDK.findById(req.params.id);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        let { mahk, ngaybd_dk, ngaykt_dk, is_active } = req.body;
        if (!mahk || !ngaybd_dk || !ngaykt_dk)
            return res.status(400).json({ error: 'Missing fields' });

        // Kiểm tra thứ tự ngày
        if (new Date(ngaybd_dk) >= new Date(ngaykt_dk)) {
            return res
                .status(400)
                .json({ error: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc.' });
        }

        const [result] = await DotDK.create({ mahk, ngaybd_dk, ngaykt_dk, is_active });
        const [[newRow]] = await DotDK.findById(result.insertId);
        res.status(201).json(newRow);
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        let { mahk, ngaybd_dk, ngaykt_dk, is_active } = req.body;

        // Kiểm tra thứ tự ngày
        if (ngaybd_dk && ngaykt_dk && new Date(ngaybd_dk) >= new Date(ngaykt_dk)) {
            return res
                .status(400)
                .json({ error: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc.' });
        }

        const [result] = await DotDK.update(req.params.id, {
            mahk,
            ngaybd_dk,
            ngaykt_dk,
            is_active,
        });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        const [[updated]] = await DotDK.findById(req.params.id);
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const [result] = await DotDK.remove(req.params.id);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        next(err);
    }
};


