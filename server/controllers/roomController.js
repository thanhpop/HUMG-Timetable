const Room = require('../models/roomModel');

exports.getAll = async (req, res, next) => {
    try {
        const [rows] = await Room.findAll();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const maphong = req.params.maphong;
        const [rows] = await Room.findById(maphong);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { tenphong, khu, soluong } = req.body;
        if (!tenphong || !khu || soluong == null) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const [result] = await Room.create({ tenphong, khu, soluong });
        const [[newRoom]] = await Room.findById(result.insertId);
        res.status(201).json(newRoom);
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const maphong = req.params.maphong;
        const { tenphong, khu, soluong } = req.body;
        const [result] = await Room.update(maphong, { tenphong, khu, soluong });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        const [[updated]] = await Room.findById(maphong);
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const maphong = req.params.maphong;
        const [result] = await Room.remove(maphong);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        next(err);
    }
};
