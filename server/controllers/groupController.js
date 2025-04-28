const Group = require('../models/groupModel');

exports.getAll = async (req, res, next) => {
    try {
        const [rows] = await Group.findAll();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const [rows] = await Group.findById(req.params.manhom);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { manhom, tennhom, mamh, mgv, maphong, soluongsv } = req.body;
        if (!manhom || !tennhom || !mamh || !mgv || !maphong) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const [result] = await Group.create({ manhom, tennhom, mamh, mgv, maphong, soluongsv });
        const [[newRow]] = await Group.findById(manhom);
        res.status(201).json(newRow);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Mã nhóm đã tồn tại' });
        }
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { tennhom, mamh, mgv, maphong, soluongsv } = req.body;
        const [result] = await Group.update(req.params.manhom, { tennhom, mamh, mgv, maphong, soluongsv });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        const [[updated]] = await Group.findById(req.params.manhom);
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const [result] = await Group.remove(req.params.manhom);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        next(err);
    }
};
