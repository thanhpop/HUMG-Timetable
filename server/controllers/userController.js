// controllers/userController.js
const User = require('../models/userModel');



exports.getAll = async (req, res, next) => {
    try {
        const [rows] = await User.findAll();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const [rows] = await User.findById(req.params.id);
        if (!rows.length) return res.status(404).json({ error: 'Không tìm thấy user' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { username, password, vaitro } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Thiếu username hoặc password' });
        }
        // lưu thẳng password, không hash
        const [result] = await User.create({ username, password, vaitro });
        const [[newRow]] = await User.findById(result.insertId);
        res.status(201).json(newRow);
    } catch (err) {
        // xử lý duplicate key
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username đã tồn tại' });
        }
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { password, vaitro } = req.body;
        // lưu thẳng password nếu có, không hash
        const [result] = await User.update(req.params.id, {
            password,
            vaitro
        });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy user' });
        const [[updated]] = await User.findById(req.params.id);
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const [result] = await User.remove(req.params.id);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy user' });
        res.json({ message: 'Đã xóa user' });
    } catch (err) {
        next(err);
    }
};
