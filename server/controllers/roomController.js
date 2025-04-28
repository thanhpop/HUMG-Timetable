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
        const [rows] = await Room.findById(req.params.maphong);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { maphong, tenphong, khu, soluong } = req.body;
        if (!maphong || !tenphong || !khu || soluong == null) {
            return res.status(400).json({ error: 'Missing fields' });
        }
        const [result] = await Room.create({ maphong, tenphong, khu, soluong });
        const [[newRow]] = await Room.findById(maphong);
        res.status(201).json(newRow);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Mã phòng đã tồn tại' });
        }
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { tenphong, khu, soluong } = req.body;
        const [result] = await Room.update(req.params.maphong, { tenphong, khu, soluong });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        const [[updated]] = await Room.findById(req.params.maphong);
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const [result] = await Room.remove(req.params.maphong);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        next(err);
    }
};
