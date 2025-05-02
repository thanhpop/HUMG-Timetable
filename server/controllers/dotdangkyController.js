const DotDK = require('../models/dotdangkyModel');

exports.getAll = async (req, res, next) => {
    try {
        const [rows] = await DotDK.findAll();
        res.json(rows);
    } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
    try {
        const [rows] = await DotDK.findById(req.params.id);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
    try {
        const { mahk, ngaybd_dk, ngaykt_dk } = req.body;
        if (!mahk || !ngaybd_dk || !ngaykt_dk)
            return res.status(400).json({ error: 'Missing fields' });
        const [result] = await DotDK.create({ mahk, ngaybd_dk, ngaykt_dk });
        const [[newRow]] = await DotDK.findById(result.insertId);
        res.status(201).json(newRow);
    } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
    try {
        const { mahk, ngaybd_dk, ngaykt_dk } = req.body;
        const [result] = await DotDK.update(req.params.id, { mahk, ngaybd_dk, ngaykt_dk });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        const [[updated]] = await DotDK.findById(req.params.id);
        res.json(updated);
    } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
    try {
        const [result] = await DotDK.remove(req.params.id);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) { next(err); }
};
