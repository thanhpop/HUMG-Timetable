const Semester = require('../models/semesterModel');

exports.getAll = async (req, res, next) => {
    try {
        const [rows] = await Semester.findAll();
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const [rows] = await Semester.findByKey(req.params.mahk);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { mahk, tenhk, namhoc, ngaybd, ngaykt } = req.body;
        if (!mahk || !tenhk || !namhoc || !ngaybd || !ngaykt) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const [result] = await Semester.create({ mahk, tenhk, namhoc, ngaybd, ngaykt });
        const [[newRow]] = await Semester.findByKey(mahk);
        res.status(201).json(newRow);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Mã HK đã tồn tại' });
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { tenhk, namhoc, ngaybd, ngaykt } = req.body;
        const [result] = await Semester.update(req.params.mahk, { tenhk, namhoc, ngaybd, ngaykt });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        const [[updated]] = await Semester.findByKey(req.params.mahk);
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const [result] = await Semester.remove(req.params.mahk);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        next(err);
    }
};
